import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [
    { id: 1, title: 'Work' },
    { id: 2, title: 'Hobbies' },
  ];
  constructor() { }
  getCategories(): Category[] {
    return this.categories;
  }
  getCategory(id: number): Category | undefined {
    return this.categories.find(category => category.id === id);
  }
  deleteCategory(id: number): boolean {
    const initialLength = this.categories.length;
    this.categories = this.categories.filter(category => category.id !== id);
    return this.categories.length !== initialLength;
  }
}
