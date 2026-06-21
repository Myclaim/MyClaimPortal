import requests

class EmployeesAPIClient:
    """
    Client for MyClaim Backend Employees API endpoints.
    """
    def __init__(self, base_url: str = "http://localhost:5005/api"):
        self.base_url = base_url

    def get_summary(self) -> dict:
        """
        GET summary metrics compiled from employee workloads
        """
        try:
            response = requests.get(f"{self.base_url}/employees/workload", timeout=10)
            response.raise_for_status()
            workloads = response.json()
            return {
                "total_employees": len(workloads),
                "active_adjusters": sum(1 for w in workloads if w.get("active_tickets_count", 0) > 0)
            }
        except Exception as e:
            print(f"[API Client Error] employees.get_summary failed: {e}")
            return {"total_employees": 0, "active_adjusters": 0}

    def get_workload(self) -> list:
        """
        GET /api/employees/workload
        """
        try:
            response = requests.get(f"{self.base_url}/employees/workload", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] employees.get_workload failed: {e}")
            return []

    def get_tasks(self) -> list:
        """
        GET /api/employees/tasks
        """
        try:
            response = requests.get(f"{self.base_url}/employees/tasks", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] employees.get_tasks failed: {e}")
            return []

    def get_performance(self) -> list:
        """
        GET /api/employees/performance
        """
        try:
            response = requests.get(f"{self.base_url}/employees/performance", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"[API Client Error] employees.get_performance failed: {e}")
            return []
