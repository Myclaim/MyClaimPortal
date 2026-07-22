import requests

class NotificationsAPIClient:
    """
    Client for MyClaim Backend Notifications API endpoints.
    """
    def __init__(self, base_url: str = "http://localhost:5005/api"):
        self.base_url = base_url

    def send(self, recipient: str, message: str, channels: list = None) -> dict:
        """
        POST /api/notifications/send or fallback to simulation
        """
        if channels is None:
            channels = ["email"]
        try:
            payload = {
                "recipient": recipient,
                "message": message,
                "channels": channels
            }
            response = requests.post(f"{self.base_url}/notifications", json=payload, timeout=5)
            if response.status_code in [200, 201]:
                return response.json()
        except Exception as e:
            print(f"[API Client Error] notifications.send failed: {e}")
            
        return {
            "status": "Sent (Simulated)",
            "recipient": recipient,
            "message_preview": message[:30] + "..." if len(message) > 30 else message,
            "channels_used": channels
        }
