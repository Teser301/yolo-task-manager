import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink, TaskCard],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss'
})
export class CategoryCard {
  category = input.required<Category>();
}