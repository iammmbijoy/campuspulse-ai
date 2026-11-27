import os
import re
import json
import base64
from PIL import Image
from groq import Groq
from google import genai
from google.genai import types


def _encode_image_base64(image_path: str) -> str:
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")


def analyze_incident_with_gemini(
    description: str, building: str = "", room_or_lab: str = "", image_path: str = None
) -> dict:
    """
    Multimodal AI Triage Engine: Analyzes both text (Bengali/English/Banglish) and optional
    attached photo using Groq Vision / Gemini Vision to extract category, location, urgency,
    confidence score, reasoning, and technician checklist.
    """
    has_image = bool(image_path and os.path.exists(image_path))

    prompt = f"""
    You are an expert Multimodal AI Campus Facilities & Incident Triage Engine for a university.
    Analyze the incident report text (Bengali, English, or Banglish) AND the attached photo (if provided).

    User Report Description: "{description}"
    Provided Building (if any): "{building}"
    Provided Room/Lab (if any): "{room_or_lab}"
    Photo Attached: {"Yes - inspect visual evidence for severity, hazard, and equipment type" if has_image else "No"}

    Extract and decide the following fields strictly in valid JSON format:
1. "title": A concise, clear English title for the issue (max 60 chars).
2. "detected_language": Language used in the report ("Bengali", "English", or "Banglish").
3. "category": Must be ONE of ["general", "it", "electrical", "plumbing", "lab_equipment"].
4. "building": Extracted or normalized building name (use provided building if clear, else extract from text, or null if unknown).
5. "room_or_lab": Extracted or normalized room/lab number (use provided room if clear, else extract from text, or null if unknown).
6. "urgency": Must be ONE of ["low", "medium", "high", "critical"]. (Fire, sparking, water flooding, or total network outage in active labs = critical/high).
7. "confidence_score": A float between 0.0 and 1.0 indicating confidence in your classification.
8. "reasoning": A clear explanation (1-2 sentences) explaining why you chose this category and urgency (mention visual findings if photo was attached).
9. "checklist": A JSON list of 3 to 5 actionable step-by-step troubleshooting/repair steps for the assigned technician.

    Return ONLY raw JSON without markdown formatting.
    """

    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        client = Groq(api_key=groq_key)
        last_groq_error = ""

        # Use multimodal vision model first when an image is attached
        models_to_try = (
            ["meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.1-8b-instant"]
            if has_image
            else [
                "llama-3.1-8b-instant",
                "meta-llama/llama-4-scout-17b-16e-instruct",
                "qwen/qwen3-32b",
            ]
        )

        for groq_model in models_to_try:
            try:
                if has_image and "llama-4" in groq_model:
                    base64_img = _encode_image_base64(image_path)
                    user_content = [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_img}"
                            },
                        },
                    ]
                else:
                    user_content = prompt

                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You output only valid JSON."},
                        {"role": "user", "content": user_content},
                    ],
                    model=groq_model,
                    temperature=0.2,
                    response_format={"type": "json_object"},
                )
                return json.loads(chat_completion.choices[0].message.content)
            except Exception as e:
                last_groq_error = str(e)
                continue

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            client = genai.Client(api_key=gemini_key)
            contents = [prompt]
            if has_image:
                contents.append(Image.open(image_path))
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            return _fallback_response(description, building, room_or_lab, str(e))

    return _fallback_response(description, building, room_or_lab, "No valid API key configured.")


def _fallback_response(description: str, building: str, room_or_lab: str, error_msg: str) -> dict:
    """Smart rule-based fallback extractor when external LLM API is unavailable."""
    text = description.lower()

    # 1. Smart Category Detection
    if any(k in text for k in ["pc", "computer", "router", "wifi", "internet", "network", "projector", "server"]):
        category = "it"
    elif any(k in text for k in ["ac", "short circuit", "light", "fan", "switch", "wire", "power", "current", "generator"]):
        category = "electrical"
    elif any(k in text for k in ["water", "pipe", "leak", "washroom", "toilet", "tap", "basin", "drain", "pani"]):
        category = "plumbing"
    elif any(k in text for k in ["microscope", "oscilloscope", "lab", "machine", "equipment", "chemical"]):
        category = "lab_equipment"
    else:
        category = "general"

    # 2. Smart Urgency Detection
    if any(k in text for k in ["fire", "spark", "short circuit", "flood", "urgent", "joruri", "emergency"]):
        urgency = "high"
    else:
        urgency = "medium"

    # 3. Smart Building Extraction (if not manually provided)
    extracted_building = building
    if not extracted_building:
        b_match = re.search(
            r"([a-zA-Z0-9\s]+?(?:building|bhavan|library|auditorium|canteen|hostel|hall))",
            description,
            re.IGNORECASE,
        )
        if b_match:
            extracted_building = b_match.group(1).strip().title()

    # 4. Smart Floor / Room Extraction
    extracted_room = room_or_lab
    if not extracted_room:
        r_match = re.search(
            r"((?:room|lab|floor)\s*[-:]?\s*[a-zA-Z0-9]+|\d+(?:st|nd|rd|th)\s*floor)",
            description,
            re.IGNORECASE,
        )
        if r_match:
            extracted_room = r_match.group(1).strip()

    return {
        "title": description[:55].strip().capitalize() if description else "Campus Maintenance Issue",
        "detected_language": "Banglish" if any(w in text for w in ["er", "hoye", "gese", "porche", "kisu", "korse"]) else "English",
        "category": category,
        "building": extracted_building or None,
        "room_or_lab": extracted_room or None,
        "urgency": urgency,
        "confidence_score": 0.78,
        "reasoning": f"Smart local parser extracted {category.upper()} issue at {extracted_building or 'Campus'} ({error_msg}).",
        "checklist": [
            f"Visit {extracted_building or 'reported location'} {extracted_room or ''} and inspect the {category} issue.",
            "Diagnose faulty hardware/component and apply standard repair.",
            "Verify normal operation and upload proof-of-work photo.",
        ],
    }