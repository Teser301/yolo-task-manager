from pydantic import BaseModel
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: str
    status: int
    due: datetime
    category_id: int

class TaskWithId(TaskBase):
    id: int
