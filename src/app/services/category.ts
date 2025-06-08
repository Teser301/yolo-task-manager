import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesData: Category[] = [
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

  private categoriesSubject = new BehaviorSubject<Category[]>(this.categoriesData);
  categories$ = this.categoriesSubject.asObservable();

  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }
  getCategory(id: number): Category | undefined {
    return this.categoriesSubject.value.find((c) => c.id === id);
  }

  deleteCategory(id: number): boolean {
    const updatedCategories = this.categoriesSubject.value.filter(
      (c) => c.id !== id
    );
    this.categoriesSubject.next(updatedCategories);
    return updatedCategories.length !== this.categoriesSubject.value.length;
  }

  deleteTask(categoryId: number, taskId: number): void {
    const updatedCategories = this.categoriesSubject.value.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          tasks: category.tasks.filter((task) => task.id !== taskId),
        };
      }
      return category;
    });
    this.categoriesSubject.next(updatedCategories);
  }
}