from pydantic import BaseModel, Field
from myclaim_ai.crew import MyclaimAi
from crewai import Crew, Task, Process
import json

class RoutingDecision(BaseModel):
    selected_agents: list[str] = Field(
        description="List of agent names to run in sequential order. Choices: claim_agent, document_agent, employee_agent, partner_agent, finance_agent, notification_agent, reporting_agent"
    )
    reasoning: str = Field(description="Brief explanation of why these agents were selected")

class MyClaimOrchestrator:
    def __init__(self):
        self.crew_factory = MyclaimAi()

    def route_and_execute(self, user_query: str) -> str:
        # 1. Routing Phase
        exchange_agent = self.crew_factory.exchange_agent()
        
        # Create a custom routing task
        task_config = self.crew_factory.tasks_config['routing_task']
        task_description = task_config['description'].format(user_query=user_query)
        
        routing_task = Task(
            description=task_description,
            expected_output=task_config['expected_output'],
            agent=exchange_agent,
            output_pydantic=RoutingDecision
        )
        
        routing_crew = Crew(
            agents=[exchange_agent],
            tasks=[routing_task],
            verbose=True
        )
        
        print(f"\n[Orchestrator] Running Routing Task for query: '{user_query}'...")
        routing_output = routing_crew.kickoff()
        
        # Get the parsed Pydantic object
        decision = routing_output.pydantic
        if not decision:
            # Fallback if Pydantic parsing fails
            try:
                raw_text = routing_output.raw
                if "```" in raw_text:
                    raw_text = raw_text.split("```")[1]
                    if raw_text.startswith("json"):
                        raw_text = raw_text[4:]
                data = json.loads(raw_text.strip())
                decision = RoutingDecision(
                    selected_agents=data.get("selected_agents", ["claim_agent"]),
                    reasoning=data.get("reasoning", "Fallback JSON parse")
                )
            except Exception:
                decision = RoutingDecision(
                    selected_agents=["claim_agent"],
                    reasoning="Fallback due to routing parse error"
                )
                
        print(f"[Orchestrator] Selected Agents: {decision.selected_agents}")
        print(f"[Orchestrator] Reasoning: {decision.reasoning}")

        # 2. Execution Phase
        agent_outputs = {}
        
        # Map agent name to agent function and task config key
        agent_map = {
            "claim_agent": (self.crew_factory.claim_agent, "claim_analysis_task"),
            "document_agent": (self.crew_factory.document_agent, "document_query_task"),
            "employee_agent": (self.crew_factory.employee_agent, "employee_query_task"),
            "partner_agent": (self.crew_factory.partner_agent, "partner_query_task"),
            "finance_agent": (self.crew_factory.finance_agent, "finance_query_task"),
            "notification_agent": (self.crew_factory.notification_agent, "notification_trigger_task"),
            "reporting_agent": (self.crew_factory.reporting_agent, "report_generation_task"),
        }

        # Execute each selected agent sequentially
        for agent_name in decision.selected_agents:
            if agent_name not in agent_map:
                print(f"[Orchestrator] Warning: Unknown agent '{agent_name}' ignored.")
                continue
            
            agent_func, task_key = agent_map[agent_name]
            agent_inst = agent_func()
            
            # Load template and construct task description
            sub_task_config = self.crew_factory.tasks_config[task_key]
            
            # Pass user_query, and we can also inject previous agent outputs for context if needed!
            # Let's stringify previous outputs and inject them
            previous_context_str = "\n".join([f"{k}: {v}" for k, v in agent_outputs.items()])
            
            # Format task description
            # If the template requires other variables, or does not, let's format it safely
            desc_template = sub_task_config['description']
            try:
                # If there are context placeholders in description
                task_description = desc_template.format(
                    user_query=user_query,
                    context=previous_context_str
                )
            except KeyError:
                # Fallback to simple query formatting
                task_description = desc_template.format(user_query=user_query)
            
            # Create Task instance
            task_inst = Task(
                description=task_description,
                expected_output=sub_task_config['expected_output'],
                agent=agent_inst,
            )
            
            # If reporting_agent, save output to report.md
            if agent_name == "reporting_agent":
                task_inst.output_file = 'report.md'
                
            execution_crew = Crew(
                agents=[agent_inst],
                tasks=[task_inst],
                verbose=True
            )
            
            print(f"\n[Orchestrator] Executing task with '{agent_name}'...")
            exec_output = execution_crew.kickoff()
            agent_outputs[agent_name] = exec_output.raw

        # 3. Merge Phase
        print(f"\n[Orchestrator] Running Merge/Final Response Task...")
        
        # Convert agent outputs to a string
        outputs_summary = ""
        for name, output in agent_outputs.items():
            outputs_summary += f"\n--- Output from {name} ---\n{output}\n"
            
        merge_task_config = self.crew_factory.tasks_config['merge_task']
        merge_task_desc = merge_task_config['description'].format(
            user_query=user_query,
            agent_outputs=outputs_summary
        )
        
        merge_task = Task(
            description=merge_task_desc,
            expected_output=merge_task_config['expected_output'],
            agent=exchange_agent
        )
        
        merge_crew = Crew(
            agents=[exchange_agent],
            tasks=[merge_task],
            verbose=True
        )
        
        final_output = merge_crew.kickoff()
        return final_output.raw
