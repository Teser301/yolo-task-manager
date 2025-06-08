import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { TaskCard } from '../task-card/task-card';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink, TaskCard],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss'
})
export class CategoryCard {
  category = input.required<Category>();
  delete = output<number>();
  edit = output<Category>();

  constructor(private categoryService: CategoryService) { }

  onDelete() {
    console.log('trying to delete')
    this.delete.emit(this.category().id);
  }

  onEdit() {
    this.edit.emit(this.category());
  }
}