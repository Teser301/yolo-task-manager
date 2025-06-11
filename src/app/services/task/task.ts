import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';
import { CategoryService } from '../category/category';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000'; // Adjust if tasks are on a separate route

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private categoryService: CategoryService) {
    this.loadAllTasks();
  }

  private loadAllTasks(): void {
    this.http.get<Task[]>(`${this.apiUrl}/tasks`).pipe(
      catchError(err => {
        console.error('Error loading tasks', err);
        return of([]);
      })
    ).subscribe(tasks => this.tasksSubject.next(tasks));
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`).pipe(
      tap(tasks => this.tasksSubject.next(tasks)),
      catchError(err => {
        console.error('Error fetching tasks', err);
        return throwError(() => err);
      })
    );
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  createNewTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task).pipe(
      tap(() => this.loadAllTasks()), // Refresh the complete list
      catchError(err => {
        console.error('Task creation failed:', err);
        return throwError(() => err);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`).pipe(
      tap(() => {
        // Update the BehaviorSubject
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next(currentTasks.filter(task => task.id !== id));

        // Refresh categories if needed
        this.categoryService.getCategories().subscribe();
      }),
      catchError(err => {
        console.error('Error deleting task:', err);
        return throwError(() => err);
      })
    );
  }

  editTask(id: number, updatedTask: Task): Observable<Task> {
    // Format the due date if it exists
    const taskToSend = {
      ...updatedTask,
      due: updatedTask.due ? new Date(updatedTask.due).toISOString() : null
    };

    console.log(id);
    console.log(taskToSend);

    const current = this.tasksSubject.value;
    this.tasksSubject.next(
      current.map(t => t.id === id ? { ...t, ...updatedTask } : t)
    );

    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, taskToSend).pipe(
      tap(() => {
        this.categoryService.getCategories().subscribe();
      }),
      catchError(err => {
        this.tasksSubject.next(current);
        return throwError(() => err);
      })
    );
  }
}
