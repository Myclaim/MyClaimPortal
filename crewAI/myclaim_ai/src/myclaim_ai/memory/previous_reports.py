from pydantic import BaseModel, Field
from datetime import datetime

class ReportSummary(BaseModel):
    report_id: str
    title: str
    generated_at: datetime = Field(default_factory=datetime.now)
    summary_text: str

class PreviousReportsMemory:
    """
    Placeholder for database-backed storage of generated reports and their summaries.
    """
    def __init__(self):
        self.reports: list[ReportSummary] = []

    def cache_report(self, report_id: str, title: str, summary_text: str):
        self.reports.append(ReportSummary(report_id=report_id, title=title, summary_text=summary_text))

    def get_reports(self) -> list[ReportSummary]:
        return self.reports
