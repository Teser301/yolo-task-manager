from pydantic import BaseModel
from typing import List
from .task import TaskWithId

class CategoryBase(BaseModel):
    title: str
    description: str
    tasks: List[TaskWithId]

class CategoryWithId(CategoryBase):
    id: int
