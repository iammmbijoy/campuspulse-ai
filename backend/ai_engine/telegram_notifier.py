import os
import urllib.request
import urllib.parse
import json


def send_telegram_alert(message: str, target_chat_id: str = None) -> bool:
    """
    Sends instant real-time notifications via Telegram Bot API.
    If target_chat_id is provided (e.g., specific technician or student's Telegram ID),
    it sends directly to that user; otherwise falls back to central admin TELEGRAM_CHAT_ID.
    """
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = target_chat_id or os.getenv("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        print(f"[Telegram Alert Preview (Target: {chat_id or 'Admin'})]:\n{message}\n")
        return False

    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML",
        }
        data = urllib.parse.urlencode(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result.get("ok", False)
    except Exception as e:
        print(f"[Telegram Notification Error]: {e}")
        return False