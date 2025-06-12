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

  filteredCategories$ = this.categories$;
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
  // Get All Categories
  getCategories(): Observable<Category[]> {
    const currentCategories = this.allCategoriesSubject.value;

    if (currentCategories.length === 0) {
      return this.fetchCategoriesFromServer().pipe(
        map(() => {
          const categories = this.allCategoriesSubject.value;
          const filterFn = this.filterFnSubject.value;
          return categories.filter(filterFn);
        })
      );
    } else {
      const filterFn = this.filterFnSubject.value;
      return new Observable(observer => {
        observer.next(currentCategories.filter(filterFn));
        observer.complete();
      });
    }
  }
  // Get category by ID
  getCategoryById(id: number): Observable<Category> {
    var url = `${this.apiUrl}/categories/${id}`
    return this.http.get<Category>(url);
  }

  // Create and Delete with Optimistic Behaviour
  createNewCategory(category: Category): Observable<Category> {
    const url = `${this.apiUrl}/categories`;
    const current = this.allCategoriesSubject.value;

    // Trying Optimistic Behavior
    // So Im generating a temporary fake ID so the ui can track it
    const tempId = Math.floor(Math.random() * -10000);
    const optimisticCategory: Category = { ...category, id: tempId };
    // Then add it to the UI, expecting it to be there already
    this.allCategoriesSubject.next([...current, optimisticCategory]);

    return this.http.post<Category>(url, category).pipe(
      // For testing optimistic behaviour
      // delay(2000),
      tap((newCategory) => {
        // Replace the temp category with the real one when it's done
        const updated = this.allCategoriesSubject.value.map(c =>
          c.id === tempId ? newCategory : c
        );
        this.allCategoriesSubject.next(updated);
      }),
      catchError(err => {
        // If it turns out it wasn't there
        this.allCategoriesSubject.next(current);
        return throwError(() => err);
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    const url = `${this.apiUrl}/categories/${id}`;
    const currentCategories = this.allCategoriesSubject.value;

    // Optimistic update - remove category first
    this.allCategoriesSubject.next(currentCategories.filter(c => c.id !== id));

    // Also remove all tasks for this category (optimistically)
    this.taskService.deleteTasksForCategory(id);  // You'll need to implement this in TaskService

    return this.http.delete<void>(url).pipe(
      catchError(err => {
        // Revert both categories and tasks on error
        this.allCategoriesSubject.next(currentCategories);
        console.error('Delete failed:', err);
        return throwError(() => err);
      })
    );
  }

  // Edit categories
  editCategory(id: number, category: Category): Observable<Category> {
    const url = `${this.apiUrl}/categories/${id}`;
    const current = this.allCategoriesSubject.value;

    // Optimistic update
    this.allCategoriesSubject.next(
      current.map(c => c.id === id ? { ...c, ...category } : c)
    );

    return this.http.put<Category>(url, category).pipe(
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

  setCategoryFilter(fn: (c: Category) => boolean): void {
    this.filterFnSubject.next(fn);
  }

  clearCategoryFilter(): void {
    this.filterFnSubject.next(() => true);
  }

  // Helper method to get current filtered categories synchronously
  getCurrentFilteredCategories(): Category[] {
    const categories = this.allCategoriesSubject.value;
    const filterFn = this.filterFnSubject.value;
    return categories.filter(filterFn);
  }

  // Helper method to check if categories are loaded
  get hasLoadedCategories(): boolean {
    return this.allCategoriesSubject.value.length > 0;
  }
}