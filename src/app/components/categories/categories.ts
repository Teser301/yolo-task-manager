import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  imports: [RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories {
  categoryService = inject(CategoryService)
  currentRoute = inject(ActivatedRoute)

  category: Category | undefined;


  constructor() {
    const id = Number(this.currentRoute.snapshot.paramMap.get('id'));
    this.category = this.categoryService.getCategory(id);
  }
}
