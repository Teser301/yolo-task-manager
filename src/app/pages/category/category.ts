import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category';
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
  onDeleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id);
      this.router.navigate(['/']); // Redirect to home after deletion
    }
  }
}
