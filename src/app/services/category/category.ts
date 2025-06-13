import { inject, Injectable } from '@angular/core';
import { Category } from '../../models/category.model';
import { BehaviorSubject, Observable, tap, catchError, throwError, delay, combineLatest, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TaskService } from '../task/task';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';
  private endpoints = {
    categories: `${this.apiUrl}/categories`,
    categoryById: (id: number) => `${this.apiUrl}/categories/${id}`
  };

  private taskService = inject(TaskService);  // Add this with other injections
  // All categories
  private allCategoriesSubject = new BehaviorSubject<Category[]>([]);
  // Filter
  private filterFnSubject = new BehaviorSubject<(c: Category) => boolean>(() => true);
  // Specific category
  private categorySubject = new BehaviorSubject<number | null>(null);

  categories$ = combineLatest([
    this.allCategoriesSubject.asObservable(),
    this.filterFnSubject.asObservable()
  ]).pipe(
    map(([categories, filterFn]) => categories.filter(filterFn))
  );

  allCategories$ = this.allCategoriesSubject.asObservable();
  category$ = this.categorySubject.asObservable();

  constructor() { }

  private fetchCategoriesFromServer(): Observable<Category[]> {
    const url = `${this.apiUrl}/categories`;
    return this.http.get<Category[]>(url).pipe(
      tap({
        next: (categories) => {
          console.log('Fetched categories:', categories);
          this.allCategoriesSubject.next(categories);
        },
        error: (err) => console.error('Fetch error:', err)
      })
    );
  }

  loadCategories(): Observable<Category[]> {
    return this.fetchCategoriesFromServer();
  }

  // Get category by ID
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(this.endpoints.categoryById(id));
  }

  // Create and Delete with Optimistic Behaviour
  createNewCategory(category: Category): Observable<Category> {
    const current = this.allCategoriesSubject.value;

    // First check for duplicate name
    const duplicate = current.find(c =>
      c.title.toLowerCase() === category.title.toLowerCase()
    );

    if (duplicate) {
      return throwError(() => ({
        status: 400,
        error: { message: `A category with the title "${category.title}" already exists` }
      }));
    }

    // Trying Optimistic Behavior
    const tempId = Math.floor(Math.random() * -10000);
    const optimisticCategory: Category = { ...category, id: tempId };

    this.allCategoriesSubject.next([...current, optimisticCategory]);

    return this.http.post<Category>(this.endpoints.categories, category).pipe(
      tap((newCategory) => {
        const updated = this.allCategoriesSubject.value.map(c =>
          c.id === tempId ? newCategory : c
        );
        this.allCategoriesSubject.next(updated);
      }),
      catchError(err => {
        this.allCategoriesSubject.next(current);
        return throwError(() => err);
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    const currentCategories = this.allCategoriesSubject.value;
    // Optimistic update - remove category first
    this.allCategoriesSubject.next(currentCategories.filter(c => c.id !== id));
    // Also remove all tasks for this category (optimistically)
    this.taskService.deleteTasksForCategory(id);  // You'll need to implement this in TaskService
    return this.http.delete<void>(this.endpoints.categoryById(id)).pipe(
      catchError(err => {
        // Revert both categories and tasks on error
        this.allCategoriesSubject.next(currentCategories);
        console.error('Delete failed:', err);
        return throwError(() => err);
      })
    );
  }

  editCategory(id: number, category: Category): Observable<Category> {
    const url = `${this.apiUrl}/categories/${id}`;
    const current = this.allCategoriesSubject.value;

    // Optimistic update
    this.allCategoriesSubject.next(
      current.map(c => c.id === id ? { ...c, ...category } : c)
    );

    return this.http.put<Category>(this.endpoints.categoryById(id), category).pipe(
      tap(updatedCategory => {
        // Update with the actual server response
        const newState = current.map(c => c.id === id ? updatedCategory : c);
        this.allCategoriesSubject.next(newState);
        this.categorySubject.next(id); // Notify specific category update
      }),
      catchError(err => {
        // Revert on error
        this.allCategoriesSubject.next(current);
        return throwError(() => err);
      })
    );
  }

  // Filter

  // Helper method to check if categories are loaded
  get hasLoadedCategories(): boolean {
    return this.allCategoriesSubject.value.length > 0;
  }
}