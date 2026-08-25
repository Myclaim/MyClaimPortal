from myclaim_ai.api_clients.documents_api import DocumentsAPIClient

_client = DocumentsAPIClient()

def get_missing_documents() -> list:
    """
    Returns real missing documents from the database via backend API.
    """
    return _client.get_missing_documents()

def get_document_status(doc_id: str) -> dict:
    """
    Returns real status of a document from the database via backend API.
    """
    return _client.get_status(doc_id)
