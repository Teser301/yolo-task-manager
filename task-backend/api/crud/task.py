from sqlalchemy.orm import Session
from database.schemas.task import Task
from api.models.task import TaskBase, TaskWithId
from typing import List, Optional

def create_task(db: Session, task: TaskBase) -> Task:
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: int) -> Optional[TaskWithId]:
    return db.query(Task).filter(Task.id == task_id).first()

def get_tasks(db: Session ) -> List[Task]:
    return db.query(Task).all()

def get_tasks_by_category(db: Session, category_id: int) -> List[Task]:
    return db.query(Task).filter(Task.category_id == category_id).all()

def update_task(db: Session, task_update: TaskWithId) -> Optional[TaskWithId]:
    db_task = db.query(Task).filter(Task.id == task_update.id).first()
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