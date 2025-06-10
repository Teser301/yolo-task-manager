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
  public categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor() { }

  // Get All Categories
  getCategories(): Observable<Category[]> {
    var url = `${this.apiUrl}/categories`
    return this.http.get<Category[]>(url).pipe(
      tap({
        next: (categories) => {
          console.log('Fetched categories:', categories);
          this.categoriesSubject.next(categories); // <-- Update subject here
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
    const current = this.categoriesSubject.value;

    // Trying Optimistic Behavior
    // So Im generating a temporary fake ID so the ui can track it
    const tempId = Math.floor(Math.random() * -10000);
    const optimisticCategory: Category = { ...category, id: tempId };
    // Then add it to the UI, expecting it to be there already
    this.categoriesSubject.next([...current, optimisticCategory]);

    return this.http.post<Category>(url, category).pipe(
      // For testing optimistic behaviour
      // delay(2000),
      tap((newCategory) => {
        // Replace the temp category with the real one when it's done
        const updated = this.categoriesSubject.value.map(c =>
          c.id === tempId ? newCategory : c
        );
        this.categoriesSubject.next(updated);
      }),
      catchError(err => {
        // If it turns out it wasn't there
        this.categoriesSubject.next(current);
        return throwError(() => err);
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    // Optimistic update
    const url = `${this.apiUrl}/categories/${id}`
    const current = this.categoriesSubject.value;
    this.categoriesSubject.next(current.filter(c => c.id !== id));

    return this.http.delete<void>(url).pipe(
      catchError(err => {
        this.categoriesSubject.next(current);
        console.error('Delete failed:', err);
        return throwError(() => err);
      })
    );
  }

  // Edit categories
  editCategory(id: number, category: Category): Observable<Category> {
    const url = `${this.apiUrl}/categories/${id}`;
    const current = this.categoriesSubject.value;

    // Optimistic update
    this.categoriesSubject.next(
      current.map(c => c.id === id ? { ...c, ...category } : c)
    );

    return this.http.put<Category>(url, category).pipe(
      catchError(err => {
        // Revert on error
        this.categoriesSubject.next(current);
        return throwError(() => err);
      })
    );
  }
}