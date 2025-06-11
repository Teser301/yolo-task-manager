from pydantic import BaseModel
from typing import List, Optional
from .task import TaskWithId, TaskCreate

# Input model for updates
class CategoryBase(BaseModel):
    title: str
    description: str

class CategoryUpdate(CategoryBase):
    tasks: Optional[List[TaskCreate]] = None  # Optional in updates

# Output model
class CategoryWithId(CategoryBase):
    id: int
    tasks: List[TaskWithId] = []

    class Config:
        orm_mode = True
