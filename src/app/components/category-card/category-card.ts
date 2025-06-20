import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { TaskCard } from '../task-card/task-card';
import { CategoryService } from '../../services/category/category';
import { ModalService } from '../../services/modal/modal';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink, TaskCard, Icon],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss'
})
export class CategoryCard {
  category = input.required<Category>();
  categoryDeleted = output<number>();
  edit = output<Category>();
  taskDeleted = output<{ taskId: number, categoryId: number }>();
  constructor(
    private categoryService: CategoryService,
    public modalService: ModalService
  ) { }

  onDelete() {
    if (confirm('Are you sure?')) {
      this.categoryService.deleteCategory(this.category().id)
        .subscribe({
          next: () => this.categoryDeleted.emit(this.category().id),
          error: (err) => alert('Failed to delete')
        });
    }
  }

  onEdit() {
    this.edit.emit(this.category());
    this.modalService.showEditCategory(this.category());
  }

  handleTaskDeleted(deletedTaskId: number) {
    this.taskDeleted.emit({
      taskId: deletedTaskId,
      categoryId: this.category().id
    });
  }
}