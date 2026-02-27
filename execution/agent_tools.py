from langchain_core.tools import tool
from pydantic import BaseModel, Field
import httpx
from typing import Dict, Any

# These tools mock interacting with our own FastAPI backend via HTTP, 
# simulating how microservices or separate DBs would be queried.
# For simplicity, they assume FastAPI is running on localhost:8000

class InventoryInput(BaseModel):
    medicine_name: str = Field(description="Name of the medicine to check stock for. E.g., 'Paracetamol'")

@tool("inventory_checker", args_schema=InventoryInput)
def check_inventory(medicine_name: str) -> str:
    """Check if a specific medication is in stock. Returns stock count and prescription requirement."""
    try:
        response = httpx.get(f"http://localhost:8000/inventory/{medicine_name}")
        if response.status_code == 200:
            data = response.json()
            return f"Found {data['name']}. Stock Level: {data['stock_level']}. Prescription Required: {data['prescription_required']}."
        else:
            return f"Error checking inventory: Medicine {medicine_name} not found."
    except Exception as e:
        return f"System Error: {str(e)}"

class PrescriptionInput(BaseModel):
    user_id: str = Field(description="The ID or Name of the User ordering the drug.")
    medicine_name: str = Field(description="The medication they are trying to order.")

@tool("prescription_validator", args_schema=PrescriptionInput)
def check_prescription(user_id: str, medicine_name: str) -> str:
    """Check if the user has a valid prescription on file."""
    try:
        response = httpx.get(f"http://localhost:8000/users/{user_id}")
        if response.status_code == 200:
            data = response.json()
            has_script = data.get("has_valid_prescription", False)
            if has_script:
                return f"User {user_id} has a valid prescription on file. Cleared for {medicine_name}."
            else:
                return f"User {user_id} DOES NOT have a valid prescription. Reject order for {medicine_name}."
        else:
            return f"Error checking user profile: User {user_id} not found."
    except Exception as e:
        return f"System Error: {str(e)}"

class OrderInput(BaseModel):
    user_id: str = Field(description="The User ID placing the order.")
    medicine_name: str = Field(description="The required medication.")
    quantity: int = Field(description="Number of units to order.")

@tool("order_executor", args_schema=OrderInput)
def execute_order(user_id: str, medicine_name: str, quantity: int) -> str:
    """Places the final order into the database. ONLY call this if inventory & prescription checks have passed!"""
    try:
        payload = {
            "user_id": user_id,
            "items": [{"medicine_name": medicine_name, "quantity": quantity}]
        }
        response = httpx.post(f"http://localhost:8000/orders", json=payload)
        if response.status_code == 200:
            data = response.json()
            return f"Success! Order confirmed. Order ID: {data.get('id', data.get('_id', 'Confirmed'))}"
        else:
            return f"Order failed: {response.text}"
    except Exception as e:
        return f"System Error executing order: {str(e)}"
