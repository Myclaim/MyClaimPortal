#!/usr/bin/env python
import sys
import warnings
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

from myclaim_ai.orchestrator import MyClaimOrchestrator

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def run():
    """
    Run the crew orchestrator with demo queries or a custom query from cli arguments.
    """
    orchestrator = MyClaimOrchestrator()
    
    # Check if a custom query was passed via command line
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        print(f"\nRunning custom query: \"{query}\"")
        try:
            result = orchestrator.route_and_execute(query)
            print(f"\n[Result Output]:\n{result}")
        except Exception as e:
            print(f"Error executing custom query: {e}")
            sys.exit(1)
        return

    # Otherwise, run the default sequence of demo queries to demonstrate routing
    demo_queries = [
        "Show pending claims"
    ]
    
    print("=" * 60)
    print("MYCLAIM AI OS - MULTI-AGENT ROUTING AND EXECUTION TEST")
    print("=" * 60)
    
    for idx, query in enumerate(demo_queries, 1):
        if idx > 1:
            print(f"\n[Rate Limit Protection] Sleeping for 20 seconds...")
            time.sleep(20)
        print(f"\n[Test {idx}] Query: \"{query}\"")
        try:
            result = orchestrator.route_and_execute(query)
            print(f"\n[Result {idx} Output]:\n{result}")
            print("-" * 60)
        except Exception as e:
            print(f"Error executing query '{query}': {e}")
            sys.exit(1)


def train():
    """
    Train the crew for a given number of iterations.
    """
    inputs = {
        "topic": "AI LLMs",
        'current_year': str(datetime.now().year)
    }
    try:
        from myclaim_ai.crew import MyclaimAi
        MyclaimAi().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        from myclaim_ai.crew import MyclaimAi
        MyclaimAi().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution and returns the results.
    """
    inputs = {
        "topic": "AI LLMs",
        "current_year": str(datetime.now().year)
    }

    try:
        from myclaim_ai.crew import MyclaimAi
        MyclaimAi().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")

def run_with_trigger():
    """
    Run the crew with trigger payload.
    """
    import json
    from myclaim_ai.crew import MyclaimAi

    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    inputs = {
        "crewai_trigger_payload": trigger_payload,
        "topic": "",
        "current_year": ""
    }

    try:
        result = MyclaimAi().crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew with trigger: {e}")
