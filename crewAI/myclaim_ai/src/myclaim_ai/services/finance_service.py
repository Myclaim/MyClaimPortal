from myclaim_ai.api_clients.finance_api import FinanceAPIClient

_client = FinanceAPIClient()

def get_financial_summary() -> dict:
    """
    Returns real financial summary count via backend API.
    """
    return _client.get_summary()

def get_payouts_status() -> list:
    """
    Returns real payouts list via backend API.
    """
    return _client.get_payments()
