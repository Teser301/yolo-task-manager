import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000'; // Adjust if tasks are on a separate route

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor() { }

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
    console.log(task)
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task).pipe(
      tap(realTask => {
        const current = this.tasksSubject.value;
        this.tasksSubject.next([...current, realTask]);
      }),
      catchError(err => {
        console.error('Task creation failed:', err);
        return throwError(() => err);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    const current = this.tasksSubject.value;
    this.tasksSubject.next(current.filter(t => t.id !== id));

    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`).pipe(
      catchError(err => {
        this.tasksSubject.next(current);
        return throwError(() => err);
      })
    );
  }

  editTask(id: number, updatedTask: Task): Observable<Task> {
    const current = this.tasksSubject.value;
    this.tasksSubject.next(
      current.map(t => t.id === id ? { ...t, ...updatedTask } : t)
    );

    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, updatedTask).pipe(
      catchError(err => {
        this.tasksSubject.next(current);
        return throwError(() => err);
      })
    );
  }
}
