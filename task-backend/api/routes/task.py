from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from api.models.task import TaskBase,  TaskWithId
from api.crud import task as crud_task

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskWithId)
def create_task(task: TaskBase, db: Session = Depends(get_db)):
    return crud_task.create_task(db=db, task=task)

@router.get("/", response_model=List[TaskWithId])
def read_tasks(db: Session = Depends(get_db)):
    return crud_task.get_tasks(db=db)

@router.get("/{task_id}", response_model=TaskWithId)
def read_task(task_id: int, db: Session = Depends(get_db)):
    db_task = crud_task.get_task(db=db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.get("/category/{category_id}", response_model=List[TaskWithId])
def read_tasks_by_category(category_id: int, db: Session = Depends(get_db)):
    return crud_task.get_tasks_by_category(db=db, category_id=category_id)

@router.put("/{id}", response_model=TaskWithId)
def update_task(id: int, task_update: TaskBase, db: Session = Depends(get_db)):
    db_task = crud_task.update_task(db=db, task_id=id, task_update=task_update)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = crud_task.delete_task(db=db, task_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}
