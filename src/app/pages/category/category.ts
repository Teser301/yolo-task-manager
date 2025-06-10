import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';
import { TaskCard } from '../../components/task-card/task-card';

@Component({
  selector: 'app-category',
  imports: [RouterLink, TaskCard],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class CategoryView implements OnInit {
  category: Category | undefined;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);

  ngOnInit() {
    const id = Number(this.route.parent?.snapshot.paramMap.get('categoryId'));

    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.category = category; // Assign the resolved Category object
      },
      error: (err) => {
        console.error('Failed to load category:', err);
      }
    });
  }
  handleCategoryDeleted(id: number): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Failed to delete category', err);
        alert('Could not delete category. Please try again.');
      }
    });
  }
}
