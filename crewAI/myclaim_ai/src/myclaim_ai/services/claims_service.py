from myclaim_ai.api_clients.claims_api import ClaimsAPIClient

_client = ClaimsAPIClient()

def get_claim_summary() -> dict:
    """
    Returns real summary metrics from the database via backend API.
    """
    return _client.get_summary()

def get_pending_claims() -> list:
    """
    Returns real pending claims from the database via backend API.
    """
    return _client.get_pending()
