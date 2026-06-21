import requests

class PartnersAPIClient:
    """
    Client for MyClaim Backend Partners API endpoints.
    """
    def __init__(self, base_url: str = "http://localhost:5005/api"):
        self.base_url = base_url

    def get_list(self) -> list:
        """
        GET /api/partners
        """
        try:
            response = requests.get(f"{self.base_url}/partners", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] partners.get_list failed: {e}")
            return []

    def get_leads(self) -> list:
        """
        GET /api/partners/leads
        """
        try:
            response = requests.get(f"{self.base_url}/partners/leads", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] partners.get_leads failed: {e}")
            return []

    def get_conversions(self) -> list:
        """
        GET /api/partners/conversions
        """
        try:
            response = requests.get(f"{self.base_url}/partners/conversions", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] partners.get_conversions failed: {e}")
            return []
