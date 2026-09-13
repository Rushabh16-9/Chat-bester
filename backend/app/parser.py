import re
from datetime import datetime
from typing import List, Dict, Any, Optional

# Regular expressions for matching WhatsApp chat lines
# Format 1: 9/2/23, 23:20 - Sender: Message or 2/5/24, 18:57 - System message
LINE_REGEX_1 = re.compile(r'^(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*-\s*(.+)$')

# Format 2: [02/09/2023, 23:20:15] Sender: Message
LINE_REGEX_2 = re.compile(r'^\[(\d{1,2}/\d{1,2}/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)\s*\]\s*(.+)$')

# Emoji extraction regex pattern
EMOJI_PATTERN = re.compile(
    r'[\U0001F600-\U0001F64F'  # Emoticons
    r'\U0001F300-\U0001F5FF'  # Symbols & Pictographs
    r'\U0001F680-\U0001F6FF'  # Transport & Map Symbols
    r'\U0001F1E0-\U0001F1FF'  # Flags
    r'\U00002600-\U000026FF'  # Misc Symbols
    r'\U00002700-\U000027BF'  # Dingbats
    r'\U0001F900-\U0001F9FF'  # Supplemental Symbols
    r'\U0001FA70-\U0001FAFF'  # Symbols and Pictographs Extended-A
    r'\U0001F60-\U0001F64'
    r']+', flags=re.UNICODE
)

SYSTEM_PATTERNS = [
    "Messages and calls are end-to-end encrypted",
    "is a contact",
    "changed their phone number",
    "added you",
    "created group",
    "changed the group description",
    "left",
]

def parse_datetime(date_str: str, time_str: str) -> Optional[datetime]:
    time_str = time_str.strip()
    date_str = date_str.strip()
    
    # Try different format combinations
    formats = [
        ("%m/%d/%y %H:%M", False),
        ("%d/%m/%y %H:%M", False),
        ("%m/%d/%Y %H:%M", False),
        ("%d/%m/%Y %H:%M", False),
        ("%m/%d/%y %I:%M %p", True),
        ("%d/%m/%y %I:%M %p", True),
        ("%m/%d/%Y %I:%M %p", True),
        ("%d/%m/%Y %I:%M %p", True),
        ("%m/%d/%y %H:%M:%S", False),
        ("%d/%m/%y %H:%M:%S", False),
    ]
    
    dt_combo = f"{date_str} {time_str}"
    for fmt, _ in formats:
        try:
            return datetime.strptime(dt_combo, fmt)
        except ValueError:
            continue
    return None

def parse_whatsapp_chat(raw_text: str) -> List[Dict[str, Any]]:
    lines = raw_text.splitlines()
    parsed_messages: List[Dict[str, Any]] = []
    
    current_msg = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        match1 = LINE_REGEX_1.match(line)
        match2 = LINE_REGEX_2.match(line)
        match = match1 or match2
        
        if match:
            # Commit existing current_msg if any
            if current_msg:
                parsed_messages.append(current_msg)
                current_msg = None
                
            date_part, time_part, content_part = match.groups()
            
            # Check if content_part has "Sender: Message" or is a system notification
            if ":" in content_part:
                sender, message = content_part.split(":", 1)
                sender = sender.strip()
                message = message.strip()
                
                # Filter out "Sender is a contact" if it matched sender
                if any(sys_p in content_part for sys_p in SYSTEM_PATTERNS) and not message:
                    continue
                    
                dt = parse_datetime(date_part, time_part)
                
                current_msg = {
                    "date_raw": date_part,
                    "time_raw": time_part,
                    "datetime": dt,
                    "sender": sender,
                    "message": message,
                    "is_system": False,
                    "is_media": "<Media omitted>" in message or "(file attached)" in message,
                    "is_deleted": "You deleted this message" in message or "This message was deleted" in message,
                }
            else:
                # System message like "2/5/24, 18:57 - Kushlo is a contact" or security info
                dt = parse_datetime(date_part, time_part)
                current_msg = {
                    "date_raw": date_part,
                    "time_raw": time_part,
                    "datetime": dt,
                    "sender": "System",
                    "message": content_part,
                    "is_system": True,
                    "is_media": False,
                    "is_deleted": False,
                }
        else:
            # Multi-line message continuation
            if current_msg:
                current_msg["message"] += f"\n{line}"
                if "<Media omitted>" in line or "(file attached)" in line:
                    current_msg["is_media"] = True
                if "This message was deleted" in line or "You deleted this message" in line:
                    current_msg["is_deleted"] = True

    if current_msg:
        parsed_messages.append(current_msg)
        
    return parsed_messages

def extract_emojis(text: str) -> List[str]:
    return EMOJI_PATTERN.findall(text)
