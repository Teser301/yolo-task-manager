from sqlalchemy.orm import Session
from database.schemas.task import Task
from api.models.task import TaskCreate, TaskUpdate
from typing import List, Optional

def create_task(db: Session, task: TaskCreate) -> Task:
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: int) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100) -> List[Task]:
    return db.query(Task).offset(skip).limit(limit).all()

def get_tasks_by_category(db: Session, category_id: int, skip: int = 0, limit: int = 100) -> List[Task]:
    return db.query(Task).filter(Task.category_id == category_id).offset(skip).limit(limit).all()

def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        update_data = task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int) -> bool:
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return True
    return False