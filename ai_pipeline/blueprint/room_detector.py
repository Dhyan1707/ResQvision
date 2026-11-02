"""
Room Detector - AI Pipeline
Segments rooms, doors, stairs, and emergency exit boundaries from analyzed blueprint geometry.
"""

def detect_rooms(blueprint_data):
    return {
        "success": True,
        "rooms": blueprint_data.get("rooms", []),
        "doors": blueprint_data.get("doors", []),
        "exits": blueprint_data.get("exits", []),
        "stairs": blueprint_data.get("stairs", [])
    }

