from sqlalchemy.orm import Session
from database.schemas.category import Category
from database.schemas.task import Task
from api.models.category import CategoryBase, CategoryUpdate, CategoryWithId
from typing import List, Optional

def create_category(db: Session, category: CategoryBase) -> Category:
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_category(db: Session, category_id: int) -> Optional[CategoryWithId]:
    return db.query(Category).filter(Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()

def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Optional[Category]:
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        return None

    update_data = category_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field != "tasks":
            setattr(db_category, field, value)

    if "tasks" in update_data:
        db_category.tasks.clear()
        for task_data in update_data["tasks"]:
            new_task = Task(**task_data)
            db_category.tasks.append(new_task)

    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int) -> bool:
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False