import os
import json
from PIL import Image
from groq import Groq
from google import genai
from google.genai import types


def analyze_incident_with_gemini(description: str, building: str = "", room_or_lab: str = "", image_path: str = None) -> dict:
    """
    Analyzes multilingual (Bengali/English/Banglish) incident reports using free Groq models
    (with Gemini fallback) and returns a structured JSON triage output.
    """
    prompt = f"""
    You are an expert AI Campus Facilities & Incident Triage Engine for a university.
    Analyze the following incident report (which may be in Bengali, English, or Banglish).

    User Report Description: "{description}"
    Provided Building (if any): "{building}"
    Provided Room/Lab (if any): "{room_or_lab}"

    Extract and decide the following fields strictly in valid JSON format:
    1. "title": A concise, clear English title for the issue (max 60 chars).
    2. "detected_language": Language used in the report ("Bengali", "English", or "Banglish").
    3. "category": Must be ONE of ["general", "it", "electrical", "plumbing", "lab_equipment"].
    4. "building": Extracted or normalized building name (use provided building if clear, else extract from text, or null if unknown).
    5. "room_or_lab": Extracted or normalized room/lab number (use provided room if clear, else extract from text, or null if unknown).
    6. "urgency": Must be ONE of ["low", "medium", "high", "critical"]. (Fire, sparking, water flooding, or total network outage in active labs = critical/high).
    7. "confidence_score": A float between 0.0 and 1.0 indicating confidence in your classification.
    8. "reasoning": A brief, clear explanation (1-2 sentences) explaining why you chose this category and urgency.
    9. "checklist": A JSON list of 3 to 5 actionable step-by-step troubleshooting/repair steps for the assigned technician.

    Return ONLY raw JSON without markdown formatting.
    """

    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        client = Groq(api_key=groq_key)
        last_groq_error = ""
        for groq_model in [
            "llama-3.1-8b-instant",
            "meta-llama/llama-4-scout-17b-16e-instruct",
            "qwen/qwen3-32b",
            "openai/gpt-oss-20b",
        ]:
            try:
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You output only valid JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    model=groq_model,
                    temperature=0.2,
                    response_format={"type": "json_object"},
                )
                return json.loads(chat_completion.choices[0].message.content)
            except Exception as e:
                last_groq_error = str(e)
                continue
        return _fallback_response(description, building, room_or_lab, f"Groq Error: {last_groq_error}")

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            client = genai.Client(api_key=gemini_key)
            contents = [prompt]
            if image_path and os.path.exists(image_path):
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
    """Provides a safe fallback triage output if the AI API call fails."""
    return {
        "title": description[:50] if description else "Campus Maintenance Issue",
        "detected_language": "Unknown",
        "category": "general",
        "building": building or None,
        "room_or_lab": room_or_lab or None,
        "urgency": "medium",
        "confidence_score": 0.5,
        "reasoning": f"Fallback classification applied due to AI service notice: {error_msg}",
        "checklist": [
            "Inspect the reported location and verify the issue.",
            "Identify required tools or spare parts.",
            "Resolve the issue and upload proof-of-work photo."
        ]
    }