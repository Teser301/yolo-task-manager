import { Component, inject } from '@angular/core';
import { Task } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task/task';
import { ModalService } from '../../services/modal/modal';
import { Icon } from '../../components/icon/icon';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [Icon],
  templateUrl: './task.html',
  styleUrl: './task.scss'
})

export class TaskView {
  task: Task | undefined;
  category: Category | undefined;
  loading = true;
  error: string | null = null;

  private modalService = inject(ModalService);
  private categoryService = inject(CategoryService);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.loadTaskData();
    this.setupTaskUpdates();
  }

  // Setters/Getters
  private loadTaskData(): void {
    const categoryId = Number(this.route.parent?.snapshot.paramMap.get('categoryId'));
    const taskId = Number(this.route.snapshot.paramMap.get('taskId'));

    if (!categoryId || !taskId) {
      this.error = 'Invalid category or task ID';
      this.loading = false;
      return;
    }
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        this.task = category.tasks.find(task => task.id === taskId);

        if (!this.task) {
          this.error = 'Task not found in this category';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load category:', err);
        this.error = 'Failed to load task data';
        this.loading = false;
      }
    });
  }
  private setupTaskUpdates() {
    this.taskService.tasks$.subscribe(tasks => {
      if (this.task) {
        // Find the updated version of our current task
        const updatedTask = tasks.find(t => t.id === this.task?.id);
        if (updatedTask) {
          this.task = updatedTask;
        }
      }
    });
  }
  // Handlers
  onEditTask(): void {
    if (!this.task) {
      return;
    }
    this.modalService.showEditTask(this.task);
  }
  onDeleteTask(): void {
    if (!this.task?.id) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id).subscribe({
        next: () => {
          this.returnToCategory();
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          this.error = 'Failed to delete task';
        }
      });
    }
  }
  // Helpers
  returnToCategory() {
    const categoryId = this.route.parent?.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.router.navigate(['/category', categoryId]);
    } else {
      this.router.navigate(['/']); // Fallback to home if no category ID
    }
  }

  statusText(status: number): string {
    return this.taskService.getStatusText(status);
  }
  statusColor(status: number): string {
    return this.taskService.getStatusColor(status);
  }
  formatDate(dateString: Date): string {
    return this.taskService.formatDate(dateString);
  }
}