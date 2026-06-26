from myclaim_ai.api_clients.notifications_api import NotificationsAPIClient

_client = NotificationsAPIClient()

def send_notification(recipient: str, message: str, channels: list = None) -> dict:
    """
    Triggers simulated/real notifications.
    """
    return _client.send(recipient, message, channels)
