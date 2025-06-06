import { Component } from '@angular/core';
import { Categories } from '../components/categories/categories';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [Categories, RouterLink],
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
