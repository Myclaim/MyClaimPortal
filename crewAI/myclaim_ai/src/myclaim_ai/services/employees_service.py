from myclaim_ai.api_clients.employees_api import EmployeesAPIClient

_client = EmployeesAPIClient()

def get_employee_summary() -> dict:
    """
    Returns real employee summary count via backend API.
    """
    return _client.get_summary()

def get_employee_list() -> list:
    """
    Returns real employee workload list via backend API.
    """
    return _client.get_workload()
