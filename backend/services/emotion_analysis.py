"""
Emotion analysis service. Mandatory for every chat message.
Rule-based placeholder; replace with ML model later.
Returns: emotion_label, confidence_score, risk_level, risk_score, model_version.
Raises on failure so message creation can rollback.
"""
from typing import Tuple

EMOTION_LABELS = (
    "joy", "sadness", "anger", "fear", "surprise", "neutral",
    "anxiety", "stress", "depression"
)
RISK_LEVELS = ("low", "medium", "high")
MODEL_VERSION = "rule-based-v1"


def analyze(content: str) -> Tuple[str, float, str, float, str]:
    """
    Analyze message content for emotion and risk.
    Returns (emotion_label, confidence_score, risk_level, risk_score, model_version).
    Raises ValueError if analysis fails (caller must rollback message insert).
    """
    if not content or not isinstance(content, str):
        raise ValueError("Emotion analysis requires non-empty string content")

    text = content.lower().strip()
    emotion_label = "neutral"
    confidence = 0.7
    risk_level = "low"
    risk_score = 0.0

    # Rule-based keyword mapping (extensible for ML later)
    emotion_keywords = {
        "joy": ("happy", "great", "good", "love", "thanks", "relieved", "better", "glad", "excited"),
        "sadness": ("sad", "down", "unhappy", "crying", "miss", "lost", "hopeless", "lonely"),
        "anger": ("angry", "mad", "furious", "hate", "annoyed", "frustrated", "irritated"),
        "fear": ("scared", "afraid", "worried", "fear", "panic", "terrified", "nervous"),
        "surprise": ("surprised", "shocked", "unexpected", "wow", "really"),
        "anxiety": ("anxious", "anxiety", "worried", "overwhelmed", "panic", "stressed"),
        "stress": ("stress", "stressed", "pressure", "overwhelmed", "burnout", "exhausted"),
        "depression": ("depressed", "depression", "hopeless", "empty", "nothing matters", "can't go on"),
    }

    for label, keywords in emotion_keywords.items():
        if any(k in text for k in keywords):
            emotion_label = label
            confidence = 0.75
            break

    # Risk escalation for high-concern phrases
    high_risk_phrases = ("kill myself", "end it", "don't want to live", "hurt myself", "suicide")
    medium_risk_phrases = ("can't go on", "give up", "no point", "hopeless", "nothing matters")

    if any(p in text for p in high_risk_phrases):
        risk_level = "high"
        risk_score = 0.85
        confidence = max(confidence, 0.8)
    elif any(p in text for p in medium_risk_phrases) or emotion_label in ("depression", "anxiety"):
        risk_level = "medium"
        risk_score = 0.5
        confidence = max(confidence, 0.72)

    if emotion_label not in EMOTION_LABELS:
        emotion_label = "neutral"
    if risk_level not in RISK_LEVELS:
        risk_level = "low"

    return (emotion_label, confidence, risk_level, risk_score, MODEL_VERSION)
