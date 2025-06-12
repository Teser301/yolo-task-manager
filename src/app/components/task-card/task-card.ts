import { Component, input, output } from '@angular/core';
import { Task } from '../../models/task.model';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { TaskService } from '../../services/task/task';
import { ModalService } from '../../services/modal/modal';

@Component({
  selector: 'app-task-card',
  imports: [RouterLink],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss'
})
export class TaskCard {
  task = input.required<Task>();
  taskDeleted = output<number>();
  category = input.required<Category>();

  constructor(
    private taskService: TaskService,
    public modalService: ModalService
  ) { }

  onDelete() {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task().id).subscribe({
        next: () => {
          this.taskDeleted.emit(this.task().id);
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          alert('Failed to delete task. Please try again.');
        }
      });
    }
  }

  onEdit() {
    this.modalService.showEditTask(this.task());
  }
  get statusText(): string {
    return this.taskService.getStatusText(this.task().status);
  }
  get statusColor(): string {
    return this.taskService.getStatusColor(this.task().status);
  }
  get formatDate(): string {
    return this.taskService.formatDate(this.task().due);
  }
}
