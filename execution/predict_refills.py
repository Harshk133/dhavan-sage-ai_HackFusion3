import asyncio
import datetime
from execution.db import get_database
from bson import ObjectId

async def predict_refills():
    print(f"[{datetime.datetime.now()}] Running Refill Predictor Background Job...")
    db = await get_database()
    
    users = db["users"].find({})
    alerts = []

    async for user in users:
        if not user.get("purchase_history"):
            continue
            
        for order_id_str in user["purchase_history"]:
            try:
                # Retrieve the order
                order = await db["orders"].find_one({"_id": ObjectId(order_id_str)})
                if not order or order.get("status") != "Confirmed":
                    continue
                
                order_date = order.get("order_date")
                if isinstance(order_date, str):
                    order_date = datetime.datetime.fromisoformat(order_date)
                    
                # Analyze each item
                for item in order.get("items", []):
                    med_name = item.get("medicine_name")
                    qty = item.get("quantity", 0)
                    
                    # Assume 1 pill/day for sandbox if dosage logic is too complex
                    days_supply = qty 
                    
                    depletion_date = order_date + datetime.timedelta(days=days_supply)
                    current_date = datetime.datetime.utcnow()
                    
                    days_remaining = (depletion_date - current_date).days
                    
                    # If they are out entirely or getting close (< 5 days)
                    if days_remaining <= 5:
                        alert = {
                            "user_id": str(user["_id"]),
                            "user_name": user.get("name"),
                            "medicine": med_name,
                            "days_remaining": days_remaining,
                            "depletion_date": depletion_date.isoformat(),
                            "action_required": "URGENT REFILL" if days_remaining <= 0 else "REMINDER"
                        }
                        alerts.append(alert)
            except Exception as e:
                print(f"Error processing order for user {user['_id']}: {e}")

    # In a real system we would send this to n8n webhook or save to an "alerts" collection
    if alerts:
        await db["alerts"].delete_many({}) # Clear old
        await db["alerts"].insert_many(alerts)
        print(f"Generated {len(alerts)} refill alerts. Saved to DB.")
    else:
        print("No refill alerts generated.")

if __name__ == "__main__":
    asyncio.run(predict_refills())
