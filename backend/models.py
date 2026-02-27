from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MedicineModel(BaseModel):
    id: Optional[str] = Field(Alias="_id", default=None)
    name: str = Field(..., description="Name of the medicine")
    dosage: str = Field(..., description="Dosage amount (e.g., '500mg')")
    stock_level: int = Field(0, description="Current stock available")
    prescription_required: bool = Field(False, description="Whether a prescription is required to order")

class OrderItem(BaseModel):
    medicine_name: str
    quantity: int

class OrderModel(BaseModel):
    id: Optional[str] = Field(Alias="_id", default=None)
    user_id: str
    items: List[OrderItem]
    status: str = Field("Pending", description="Pending, Confirmed, Rejected, or Fulfilled")
    order_date: datetime = Field(default_factory=datetime.utcnow)

class UserModel(BaseModel):
    id: Optional[str] = Field(Alias="_id", default=None)
    name: str
    has_valid_prescription: bool = Field(False, description="Mock flag indicating if user provided a valid prescription")
    purchase_history: List[str] = Field(default_factory=list, description="List of past Order IDs")
