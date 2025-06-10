import { inject, Injectable } from '@angular/core';
import { Category } from '../../models/category.model';
import { BehaviorSubject, Observable, tap, catchError, throwError, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  // Centralized state (starts empty, populated by API)
  private allCategoriesSubject = new BehaviorSubject<Category[]>([]);
  allCategories$ = this.allCategoriesSubject.asObservable();

  private categorySubject = new BehaviorSubject<number | null>(null);
  category$ = this.categorySubject.asObservable();

  constructor() { }


  // Get All Categories
  getCategories(): Observable<Category[]> {
    var url = `${this.apiUrl}/categories`
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
    // Optimistic update
    const url = `${this.apiUrl}/categories/${id}`
    const current = this.allCategoriesSubject.value;
    this.allCategoriesSubject.next(current.filter(c => c.id !== id));

    return this.http.delete<void>(url).pipe(
      catchError(err => {
        this.allCategoriesSubject.next(current);
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
}