from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from backend.models import MedicineModel, OrderModel, UserModel
from execution.db import get_database
from bson import ObjectId
from execution.refill_cron import start_scheduler
from execution.agent_supervisor import pharmacy_supervisor
from langchain_core.messages import HumanMessage

app = FastAPI(title="Agentic Pharmacy AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.get("/")
async def root():
    return {"message": "Welcome to Agentic Pharmacy AI API"}

# --- AGENT ROUTE ---
@app.post("/chat")
def chat_agent(data: dict):
    user_input = data.get("text", "")
    session_id = data.get("session_id", "hackathon_demo_thread")
    
    # LangGraph Execution
    inputs = {"messages": [HumanMessage(content=user_input)]}
    
    try:
        final_state = pharmacy_supervisor.invoke(
            inputs, 
            config={"configurable": {"thread_id": session_id}}
        )
        agent_response = final_state["messages"][-1].content
        return {"response": agent_response}
    except Exception as e:
        return {"response": f"[Fallback mode - AI Offline or Error] {str(e)}"}

# --- INVENTORY ROUTES ---
@app.get("/inventory", response_model=List[MedicineModel])
async def get_inventory():
    db = await get_database()
    medicines = []
    async for med in db["medicines"].find():
        med["_id"] = str(med["_id"])
        medicines.append(med)
    return medicines

@app.get("/testdb")
async def testdb():
    db = await get_database()
    collections = await db.list_collection_names()
    return {"collections": collections, "db": db.name}

@app.get("/inventory/{medicine_name}", response_model=MedicineModel)
async def get_medicine(medicine_name: str):
    db = await get_database()
    # Case-insensitive partial search
    med = await db["medicines"].find_one({"name": {"$regex": medicine_name, "$options": "i"}})
    if med:
        med["_id"] = str(med["_id"])
        return med
    raise HTTPException(status_code=404, detail="Medicine not found")

# --- ORDER ROUTES ---
@app.get("/orders")
async def get_all_orders():
    db = await get_database()
    orders = []
    async for order in db["orders"].find():
        order["_id"] = str(order["_id"])
        orders.append(order)
    return orders

@app.post("/orders", response_model=OrderModel)
async def create_order(order: OrderModel):
    db = await get_database()
    # In a full app, we would wrap this in a transaction. For the hackathon, we do it sequentially.
    
    # 1. Validate User
    try:
        query = {"_id": ObjectId(order.user_id)}
    except:
        query = {"name": order.user_id}
        
    user = await db["users"].find_one(query)
    if not user:
        # For hackathon/testing brevity, if user not found we'll just mock it or throw error
        raise HTTPException(status_code=400, detail="User not found")

    # 2. Check Inventory and Prescriptions
    for item in order.items:
        med = await db["medicines"].find_one({"name": {"$regex": item.medicine_name, "$options": "i"}})
        if not med:
            raise HTTPException(status_code=400, detail=f"Medicine {item.medicine_name} unknown")
        if med["stock_level"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {item.medicine_name}")
        if med.get("prescription_required", False) and not user.get("has_valid_prescription", False):
            raise HTTPException(status_code=400, detail=f"Prescription required for {item.medicine_name}")

    # 3. Deduct Inventory
    for item in order.items:
        await db["medicines"].update_one(
            {"name": {"$regex": item.medicine_name, "$options": "i"}},
            {"$inc": {"stock_level": -item.quantity}}
        )

    # 4. Save Order
    order_dict = order.model_dump(exclude={"id"})
    order_dict["status"] = "Confirmed" # Auto-confirm if logic passed
    result = await db["orders"].insert_one(order_dict)
    
    # Update User History
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$push": {"purchase_history": str(result.inserted_id)}}
    )

    created_order = await db["orders"].find_one({"_id": result.inserted_id})
    created_order["_id"] = str(created_order["_id"])
    return created_order

# --- USER ROUTES ---
@app.get("/users/{user_id}", response_model=UserModel)
async def get_user(user_id: str):
    db = await get_database()
    try:
        query = {"_id": ObjectId(user_id)}
    except:
        query = {"name": user_id} # fallback to name search for easy testing

    user = await db["users"].find_one(query)
    if user:
        user["_id"] = str(user["_id"])
        return user
    raise HTTPException(status_code=404, detail="User not found")

# --- ALERTS ROUTE ---
@app.get("/alerts")
async def get_alerts():
    db = await get_database()
    alerts = []
    async for alert in db["alerts"].find():
        alert["_id"] = str(alert["_id"])
        alerts.append(alert)
    return alerts

