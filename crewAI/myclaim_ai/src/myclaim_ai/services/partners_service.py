from myclaim_ai.api_clients.partners_api import PartnersAPIClient

_client = PartnersAPIClient()

def get_partner_list() -> list:
    """
    Returns real partners listing via backend API.
    """
    return _client.get_list()

def get_partner_details(partner_id: str) -> dict:
    """
    Returns partner leads or info.
    """
    leads = _client.get_leads()
    partner_leads = [lead for lead in leads if lead.get("sourceUserId") == partner_id]
    return {
        "partner_id": partner_id,
        "total_leads": len(partner_leads),
        "leads": partner_leads
    }
