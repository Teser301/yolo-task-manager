from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from api.models.category import  CategoryBase, CategoryWithId
from api.crud import category as crud_category

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=CategoryWithId)
def create_category(category: CategoryBase, db: Session = Depends(get_db)):
    return crud_category.create_category(db=db, category=category)

@router.get("/", response_model=List[CategoryWithId])
def read_categories(db: Session = Depends(get_db)):
    return crud_category.get_categories(db=db)

@router.get("/{category_id}", response_model=CategoryWithId)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud_category.get_category(db=db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.put("/{id}", response_model=CategoryWithId)
def update_category(id: int, category_update: CategoryBase, db: Session = Depends(get_db)):
    db_category = crud_category.update_category(db=db, category_id=id, category_update=category_update)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    success = crud_category.delete_category(db=db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}