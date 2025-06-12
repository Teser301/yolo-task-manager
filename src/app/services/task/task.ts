import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {
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
      tap((newTask) => {
        // Add the newly created task only after server confirmation
        this.tasksSubject.next([...this.tasksSubject.value, newTask]);
      }),
      catchError(err => {
        console.error('Task creation failed:', err);
        return throwError(() => err);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    const currentTasks = this.tasksSubject.value;

    // Optimistic update
    this.tasksSubject.next(currentTasks.filter(task => task.id !== id));

    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`).pipe(
      catchError(err => {
        // Revert optimistic update
        this.tasksSubject.next(currentTasks);
        console.error('Error deleting task:', err);
        return throwError(() => err);
      })
    );
  }

  editTask(id: number, updatedTask: Task): Observable<Task> {
    const taskToSend = {
      ...updatedTask,
      due: updatedTask.due ? new Date(updatedTask.due).toISOString() : null
    };
    const currentTasks = this.tasksSubject.value;
    // Optimistic update
    this.tasksSubject.next(
      currentTasks.map(t => t.id === id ? { ...t, ...updatedTask } : t)
    );

    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, taskToSend).pipe(
      tap((returnedTask) => {
        // Update with server response
        const updated = currentTasks.map(t => t.id === id ? returnedTask : t);
        this.tasksSubject.next(updated);
      }),
      catchError(err => {
        // Revert optimistic update
        this.tasksSubject.next(currentTasks);
        console.error('Error editing task:', err);
        return throwError(() => err);
      })
    );
  }

  deleteTasksForCategory(categoryId: number): void {
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next(currentTasks.filter(t => t.category_id !== categoryId));
  }


  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'To Do';
      case 2: return 'In Progress';
      case 3: return 'Done';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return '#facc15';
      case 2: return '#38bdf8';
      case 3: return '#4ade80';
      default: return '#94a3b8';
    }
  }

  formatDate(dateString: Date | string): string {
    if (!dateString) return 'No due date';
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  }
}