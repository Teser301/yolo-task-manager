import { Component } from "@angular/core";
import { CategoryCard } from "../../components/category-card/category-card";
import { Category } from "../../models/category.model";
import { CategoryService } from "../../services/category";


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
    this.categoryService.categories$.subscribe((categories) => {
      this.categories = categories;
    });
  }

  onDeleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id);
    }
  }

  onCreateCategory() {
    const emptyCategory = {
      title: '',
      description: '',
      tasks: []
    };

    this.categoryService.createNewCategory(emptyCategory).subscribe({
      next: (response) => {
        console.log('Category created:', response);
      },
      error: (err) => {
        console.error('Error creating category:', err);
      }
    });
  }
}
