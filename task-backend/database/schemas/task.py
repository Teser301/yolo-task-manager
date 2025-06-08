from enum import Enum
from sqlalchemy import CheckConstraint, Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base

class StatusEnum(Enum):
    TODO = 1
    INPROGRESS = 2
    DONE = 3


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(Integer, nullable=False)
    due = Column(DateTime, default=datetime.utcnow)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    __table_args__ = (
        CheckConstraint("status IN (1, 2, 3)", name='check_status'),
    )