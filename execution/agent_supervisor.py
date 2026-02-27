import os
from dotenv import load_dotenv

load_dotenv()

# We need a Model to test with. For hackathon purposes, if the user doesn't have an OpenAI key set,
# we gracefully handle it or assume a local Ollama server running.

from langchain_openai import ChatOpenAI
# from langchain_community.chat_models import ChatOllama

# Check for API keys
if os.getenv("OPENAI_API_KEY"):
    llm = ChatOpenAI(
        model=os.getenv("LLM_MODEL", "openai/gpt-4o-mini"), 
        temperature=0,
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    ) # For dev speed and accuracy
else:
    # Assume local Ollama (PharmGPT equivalent mock)
    # llm = ChatOllama(model="llama3", temperature=0)
    print("WARNING: No OPENAI_API_KEY found, falling back to dummy/local LLM configuration.")
    llm = None # We will fill this once we confirm user's environment

from typing_extensions import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from execution.agent_tools import check_inventory, check_prescription, execute_order

# 1. Define Tools
tools = [check_inventory, check_prescription, execute_order]

# 2. Define State
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]

# 3. Define the Agent Logic
def call_model(state: AgentState):
    messages = state['messages']
    
    # Prepend System Prompt based on directives
    system_prompt = """You are the Supervisor for a Pharmacy AI.
    Your goal is to help users order medications securely.
    
    CRITICAL RULES:
    1. Check inventory using `check_inventory` before placing any order.
    2. Check prescriptions using `check_prescription` before placing any order.
    3. If inventory is 0 or user lacks a prescription, YOU CANNOT place the order. Apologize and stop.
    4. If inventory and prescription are clear, use `execute_order` to finalize.
    """
    
    if not llm:
        return {"messages": [AIMessage(content="System error: No LLM configured.")]}

    # Bind tools so the LLM knows what to call
    model_with_tools = llm.bind_tools(tools)
    response = model_with_tools.invoke([{"role":"system", "content":system_prompt}] + list(messages))
    return {"messages": [response]}

from langgraph.checkpoint.memory import MemorySaver

# 4. Define Graph Components
tool_node = ToolNode(tools)

# 5. Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")

workflow.add_conditional_edges(
    "agent",
    tools_condition
)

workflow.add_edge("tools", "agent")

# Compile with memory persistence across turns
memory = MemorySaver()
pharmacy_supervisor = workflow.compile(checkpointer=memory)
