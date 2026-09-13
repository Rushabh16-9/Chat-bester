from collections import Counter
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.parser import extract_emojis

def compute_chat_analytics(parsed_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Filter non-system messages
    chat_messages = [m for m in parsed_messages if not m.get("is_system", False)]
    
    if not chat_messages:
        return {
            "total_messages": 0,
            "participants": [],
            "error": "No valid chat messages found."
        }

    senders = list(set(m["sender"] for m in chat_messages))
    
    # Initialize sender stats
    sender_stats = {
        s: {
            "name": s,
            "message_count": 0,
            "word_count": 0,
            "media_count": 0,
            "deleted_count": 0,
            "emoji_count": 0,
            "emojis": Counter(),
            "conversation_starts": 0,
            "questions_asked": 0,
            "double_text_count": 0,
            "links_shared": 0,
            "response_times_minutes": [],
        }
        for s in senders
    }
    
    total_emojis = Counter()
    hourly_distribution = {h: 0 for h in range(24)}
    day_distribution = {d: 0 for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    prev_message = None
    CONVERSATION_GAP_HOURS = 4

    for i, msg in enumerate(chat_messages):
        sender = msg["sender"]
        text = msg["message"]
        dt = msg.get("datetime")
        
        # Base counts
        sender_stats[sender]["message_count"] += 1
        words = text.split()
        sender_stats[sender]["word_count"] += len(words)
        
        if msg.get("is_media"):
            sender_stats[sender]["media_count"] += 1
        if msg.get("is_deleted"):
            sender_stats[sender]["deleted_count"] += 1
            
        if "?" in text:
            sender_stats[sender]["questions_asked"] += text.count("?")
            
        if "http://" in text or "https://" in text or "youtu.be" in text or "instagram.com" in text:
            sender_stats[sender]["links_shared"] += 1

        # Emojis
        emojis_found = extract_emojis(text)
        if emojis_found:
            sender_stats[sender]["emoji_count"] += len(emojis_found)
            for e in emojis_found:
                sender_stats[sender]["emojis"][e] += 1
                total_emojis[e] += 1

        # Time distribution & starters
        if dt:
            hourly_distribution[dt.hour] += 1
            day_distribution[day_names[dt.weekday()]] += 1
            
            if prev_message and prev_message.get("datetime"):
                prev_dt = prev_message["datetime"]
                time_diff = (dt - prev_dt).total_seconds()
                
                # Check for conversation initiation after gap
                if time_diff >= CONVERSATION_GAP_HOURS * 3600:
                    sender_stats[sender]["conversation_starts"] += 1
                
                # Response time calculation (when sender changes and within 2 hours)
                if prev_message["sender"] != sender and 0 < time_diff <= 7200:
                    sender_stats[sender]["response_times_minutes"].append(time_diff / 60.0)
                
                # Double texting detection (same sender within 2 minutes)
                if prev_message["sender"] == sender and time_diff <= 120:
                    sender_stats[sender]["double_text_count"] += 1
            else:
                # First message in history counts as starter
                sender_stats[sender]["conversation_starts"] += 1
                
        prev_message = msg

    # Format sender summaries
    total_msgs = len(chat_messages)
    participants_summary = []

    for s, stats in sender_stats.items():
        avg_resp = (
            sum(stats["response_times_minutes"]) / len(stats["response_times_minutes"])
            if stats["response_times_minutes"] else None
        )
        
        top_emojis = [
            {"emoji": em, "count": cnt} for em, cnt in stats["emojis"].most_common(5)
        ]
        
        avg_words_per_msg = round(stats["word_count"] / max(stats["message_count"], 1), 1)
        msg_percentage = round((stats["message_count"] / max(total_msgs, 1)) * 100, 1)

        participants_summary.append({
            "name": s,
            "message_count": stats["message_count"],
            "message_percentage": msg_percentage,
            "word_count": stats["word_count"],
            "avg_words_per_msg": avg_words_per_msg,
            "media_count": stats["media_count"],
            "deleted_count": stats["deleted_count"],
            "emoji_count": stats["emoji_count"],
            "top_emojis": top_emojis,
            "conversation_starts": stats["conversation_starts"],
            "questions_asked": stats["questions_asked"],
            "double_text_count": stats["double_text_count"],
            "links_shared": stats["links_shared"],
            "avg_response_time_minutes": round(avg_resp, 1) if avg_resp is not None else "N/A",
        })

    # Determine Champions / Insights
    starter_champion = max(participants_summary, key=lambda x: x["conversation_starts"])["name"] if participants_summary else "N/A"
    most_talkative = max(participants_summary, key=lambda x: x["message_count"])["name"] if participants_summary else "N/A"
    media_king = max(participants_summary, key=lambda x: x["media_count"])["name"] if participants_summary else "N/A"
    emoji_queen = max(participants_summary, key=lambda x: x["emoji_count"])["name"] if participants_summary else "N/A"

    overall_top_emojis = [
        {"emoji": em, "count": cnt} for em, cnt in total_emojis.most_common(10)
    ]

    # Sample recent snippet for AI prompt context
    recent_messages = chat_messages[-30:] if len(chat_messages) > 30 else chat_messages
    recent_snippet = "\n".join([f"{m['sender']}: {m['message']}" for m in recent_messages])

    return {
        "total_messages": total_msgs,
        "total_emojis_count": sum(total_emojis.values()),
        "participants": participants_summary,
        "starter_champion": starter_champion,
        "most_talkative": most_talkative,
        "media_king": media_king,
        "emoji_queen": emoji_queen,
        "overall_top_emojis": overall_top_emojis,
        "hourly_distribution": [{"hour": f"{h:02d}:00", "count": cnt} for h, cnt in hourly_distribution.items()],
        "day_distribution": [{"day": d, "count": cnt} for d, cnt in day_distribution.items()],
        "recent_snippet": recent_snippet,
    }
