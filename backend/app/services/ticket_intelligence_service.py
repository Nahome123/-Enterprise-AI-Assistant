from dataclasses import dataclass


@dataclass(frozen=True)
class TicketIntelligence:
    category: str
    priority: str
    routed_team: str
    suggested_response: str


CATEGORY_RULES = {
    "Security": ["breach", "phishing", "malware", "password", "access", "permission", "mfa", "sso"],
    "Billing": ["invoice", "payment", "charge", "refund", "subscription", "billing", "receipt"],
    "Technical Support": ["error", "bug", "crash", "failed", "broken", "api", "upload", "login"],
    "Data & Reporting": ["report", "dashboard", "analytics", "export", "power bi", "metrics", "data"],
    "Account Management": ["account", "plan", "renewal", "contract", "seat", "license", "user"],
}

TEAM_BY_CATEGORY = {
    "Security": "Security Operations",
    "Billing": "Finance Operations",
    "Technical Support": "Technical Support",
    "Data & Reporting": "Data Intelligence",
    "Account Management": "Customer Success",
    "General": "Customer Operations",
}

HIGH_PRIORITY_TERMS = ["urgent", "down", "outage", "blocked", "breach", "critical", "production", "cannot access"]
LOW_PRIORITY_TERMS = ["question", "how do i", "request", "nice to have", "when possible"]


def analyze_ticket(title: str, description: str) -> TicketIntelligence:
    text = f"{title} {description}".lower()
    category = "General"
    score = 0

    for candidate, keywords in CATEGORY_RULES.items():
        candidate_score = sum(1 for keyword in keywords if keyword in text)

        if candidate_score > score:
            category = candidate
            score = candidate_score

    priority = "Medium"

    if any(term in text for term in HIGH_PRIORITY_TERMS):
        priority = "High"
    elif any(term in text for term in LOW_PRIORITY_TERMS):
        priority = "Low"

    routed_team = TEAM_BY_CATEGORY.get(category, TEAM_BY_CATEGORY["General"])
    suggested_response = build_suggested_response(category, priority, routed_team)

    return TicketIntelligence(
        category=category,
        priority=priority,
        routed_team=routed_team,
        suggested_response=suggested_response,
    )


def build_suggested_response(category: str, priority: str, routed_team: str) -> str:
    urgency_line = {
        "High": "We are treating this as a high-priority request and will review it immediately.",
        "Medium": "We have routed this to the right team for review.",
        "Low": "We have logged this request and will follow up with the next useful update.",
    }[priority]

    return (
        "Thank you for the detailed report. "
        f"{urgency_line} "
        f"Based on the information provided, this appears to be a {category.lower()} issue and has been routed to {routed_team}. "
        "We will respond with findings, next steps, or any additional information needed."
    )
