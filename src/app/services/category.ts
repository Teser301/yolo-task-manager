import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [
    {
      id: 1,
      title: 'Work',
      description: 'For work things.',
      tasks: [
        {
          id: 1,
          title: 'Call Mechanic',
          status: 'To Do',
          date: new Date('2025-06-13')
        },
        {
          id: 2,
          title: 'Attend Meeting',
          status: 'In Progress',
          date: new Date('2025-06-13'),
          description: 'Quarterly planning'
        }
      ]
    },
    {
      id: 2,
      title: 'Hobbies',
      tasks: []
    }
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

  deleteTask(categoryId: number, taskId: number): void {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.tasks = category.tasks.filter(task => task.id !== taskId);
    }
  }
}