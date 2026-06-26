from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
from myclaim_ai.services import (
    get_claim_summary,
    get_pending_claims,
    get_missing_documents,
    get_employee_summary,
    get_partner_list,
    get_financial_summary,
    send_notification
)

class GetClaimSummaryInput(BaseModel):
    """Input schema for GetClaimSummary. No parameters required."""
    pass

class GetClaimSummary(BaseTool):
    name: str = "get_claim_summary"
    description: str = "Retrieves the summary of business claims, completed and rejected claim metrics, revenue, and new leads."
    args_schema: Type[BaseModel] = GetClaimSummaryInput

    def _run(self) -> dict:
        return get_claim_summary()


class GetPendingClaimsInput(BaseModel):
    """Input schema for GetPendingClaims. No parameters required."""
    pass

class GetPendingClaims(BaseTool):
    name: str = "get_pending_claims"
    description: str = "Retrieves a detailed list of pending claims currently open."
    args_schema: Type[BaseModel] = GetPendingClaimsInput

    def _run(self) -> list:
        return get_pending_claims()


class GetMissingDocumentsInput(BaseModel):
    """Input schema for GetMissingDocuments. No parameters required."""
    pass

class GetMissingDocuments(BaseTool):
    name: str = "get_missing_documents"
    description: str = "Retrieves a list of claims that are missing required document submissions."
    args_schema: Type[BaseModel] = GetMissingDocumentsInput

    def _run(self) -> list:
        return get_missing_documents()


class GetEmployeeSummaryInput(BaseModel):
    """Input schema for GetEmployeeSummary. No parameters required."""
    pass

class GetEmployeeSummary(BaseTool):
    name: str = "get_employee_summary"
    description: str = "Retrieves a summary of employee/adjuster headcount and operational status."
    args_schema: Type[BaseModel] = GetEmployeeSummaryInput

    def _run(self) -> dict:
        return get_employee_summary()


class GetPartnerListInput(BaseModel):
    """Input schema for GetPartnerList. No parameters required."""
    pass

class GetPartnerList(BaseTool):
    name: str = "get_partner_list"
    description: str = "Retrieves a list of affiliated hospital and underwriting partners."
    args_schema: Type[BaseModel] = GetPartnerListInput

    def _run(self) -> list:
        return get_partner_list()


class GetFinancialSummaryInput(BaseModel):
    """Input schema for GetFinancialSummary. No parameters required."""
    pass

class GetFinancialSummary(BaseTool):
    name: str = "get_financial_summary"
    description: str = "Retrieves the financial operations summary including MRR and outstanding claim liabilities."
    args_schema: Type[BaseModel] = GetFinancialSummaryInput

    def _run(self) -> dict:
        return get_financial_summary()


class SendNotificationInput(BaseModel):
    """Input schema for SendNotification."""
    recipient: str = Field(description="Name or email of the notification recipient")
    message: str = Field(description="Body content of the notification message")

class SendNotification(BaseTool):
    name: str = "send_notification"
    description: str = "Dispatches a system notification alert to the specified recipient."
    args_schema: Type[BaseModel] = SendNotificationInput

    def _run(self, recipient: str, message: str) -> dict:
        return send_notification(recipient, message)
