import requests

class DocumentsAPIClient:
    """
    Client for MyClaim Backend Documents API endpoints.
    """
    def __init__(self, base_url: str = "http://localhost:5005/api"):
        self.base_url = base_url

    def get_missing_documents(self) -> list:
        """
        GET /api/documents/missing
        """
        try:
            response = requests.get(f"{self.base_url}/documents/missing", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] documents.get_missing_documents failed: {e}")
            return []

    def get_status(self, doc_id: str) -> dict:
        """
        GET /api/documents/{doc_id}
        """
        try:
            response = requests.get(f"{self.base_url}/documents/{doc_id}", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] documents.get_status failed: {e}")
            return {}

    def get_pending(self) -> list:
        """
        GET /api/documents/pending
        """
        try:
            response = requests.get(f"{self.base_url}/documents/pending", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] documents.get_pending failed: {e}")
            return []

    def get_rejected(self) -> list:
        """
        GET /api/documents/rejected
        """
        try:
            response = requests.get(f"{self.base_url}/documents/rejected", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] documents.get_rejected failed: {e}")
            return []
