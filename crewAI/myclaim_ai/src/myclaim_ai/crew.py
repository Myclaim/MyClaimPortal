from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from myclaim_ai.tools.custom_tool import (
    GetClaimSummary,
    GetPendingClaims,
    GetMissingDocuments,
    GetEmployeeSummary,
    GetPartnerList,
    GetFinancialSummary,
    SendNotification
)


@CrewBase
class MyclaimAi():
    """MyClaim AI Crew"""

    agents: list[BaseAgent]
    tasks: list[Task]

    @agent
    def exchange_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['exchange_agent'],
            verbose=True
        )

    @agent
    def claim_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['claim_agent'],
            tools=[GetClaimSummary(), GetPendingClaims()],
            verbose=True
        )

    @agent
    def document_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['document_agent'],
            tools=[GetMissingDocuments()],
            verbose=True
        )

    @agent
    def employee_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['employee_agent'],
            tools=[GetEmployeeSummary()],
            verbose=True
        )

    @agent
    def partner_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['partner_agent'],
            tools=[GetPartnerList()],
            verbose=True
        )

    @agent
    def finance_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['finance_agent'],
            tools=[GetFinancialSummary()],
            verbose=True
        )

    @agent
    def notification_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['notification_agent'],
            tools=[SendNotification()],
            verbose=True
        )

    @agent
    def reporting_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['reporting_agent'],
            verbose=True
        )

    @task
    def routing_task(self) -> Task:
        return Task(
            config=self.tasks_config['routing_task']
        )

    @task
    def claim_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['claim_analysis_task']
        )

    @task
    def document_query_task(self) -> Task:
        return Task(
            config=self.tasks_config['document_query_task']
        )

    @task
    def employee_query_task(self) -> Task:
        return Task(
            config=self.tasks_config['employee_query_task']
        )

    @task
    def partner_query_task(self) -> Task:
        return Task(
            config=self.tasks_config['partner_query_task']
        )

    @task
    def finance_query_task(self) -> Task:
        return Task(
            config=self.tasks_config['finance_query_task']
        )

    @task
    def notification_trigger_task(self) -> Task:
        return Task(
            config=self.tasks_config['notification_trigger_task']
        )

    @task
    def report_generation_task(self) -> Task:
        return Task(
            config=self.tasks_config['report_generation_task'],
            output_file='report.md'
        )

    @task
    def merge_task(self) -> Task:
        return Task(
            config=self.tasks_config['merge_task']
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True
        )