from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .category import CategoryResponse

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    category_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    category_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True