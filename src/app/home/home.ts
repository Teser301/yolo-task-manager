import { Component } from '@angular/core';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category';
import { CategoryCard } from '../components/category-card/category-card';

@Component({
  selector: 'app-home',
  imports: [CategoryCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.categories = this.categoryService.getCategories();
  }

  onDeleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id);
      this.categories = this.categoryService.getCategories(); // Refresh the list
    }
  }
}
