import { Component, inject } from '@angular/core';
import { Task } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task/task';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.scss'
})

export class TaskView {
  task: Task | undefined;
  category: Category | undefined;
  loading = true;
  error: string | null = null;


  private categoryService = inject(CategoryService);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.loadTaskData();
  }
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
  returnToCategory() {
    const categoryId = this.route.parent?.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.router.navigate(['/category', categoryId]);
    } else {
      this.router.navigate(['/']); // Fallback to home if no category ID
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'To Do';
      case 2:
        return 'In Progress';
      case 3:
        return 'Done';
      default:
        return 'Unknown';
    }
  }
  getStatusColor(status: number): string {
    switch (status) {
      case 1:
        return '#facc15'; // amber – To Do
      case 2:
        return '#38bdf8'; // sky – In Progress
      case 3:
        return '#4ade80'; // green – Done
      default:
        return '#94a3b8'; // gray – Unknown
    }
  }

  formatDate(dateString: Date): string {
    if (!dateString) return 'No due date';
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  }
}