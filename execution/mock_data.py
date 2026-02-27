import asyncio
from execution.db import get_database

async def inject_mock_data():
    db = await get_database()
    
    # Check if empty
    medicines = await db["medicines"].count_documents({})
    if medicines == 0:
        await db["medicines"].insert_many([
            {"name": "Paracetamol", "dosage": "500mg", "stock_level": 100, "prescription_required": False},
            {"name": "Amoxicillin", "dosage": "250mg", "stock_level": 50, "prescription_required": True},
            {"name": "Ibuprofen", "dosage": "400mg", "stock_level": 200, "prescription_required": False},
            {"name": "Lisinopril", "dosage": "10mg", "stock_level": 30, "prescription_required": True},
        ])
        print("Injected mock medicines.")
        
    users = await db["users"].count_documents({})
    if users == 0:
        await db["users"].insert_many([
            {"name": "John Doe", "has_valid_prescription": True, "purchase_history": []},
            {"name": "Jane Smith", "has_valid_prescription": False, "purchase_history": []},
        ])
        print("Injected mock users.")

if __name__ == "__main__":
    asyncio.run(inject_mock_data())
