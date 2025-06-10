import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';
import { TaskCard } from '../../components/task-card/task-card';
import { ModalService } from '../../services/modal/modal';

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
  private modalService = inject(ModalService)

  ngOnInit() {
    const loadCategory = (id: number) => {
      this.categoryService.getCategoryById(id).subscribe({
        next: (category) => this.category = category,
        error: (err) => console.error('Failed to load category:', err)
      });
    };

    const id = Number(this.route.parent?.snapshot.paramMap.get('categoryId'));
    loadCategory(id);

    // Listen for category updates
    this.categoryService.categoryUpdated$.subscribe(updatedId => {
      if (updatedId === id) {
        loadCategory(id);
      }
    });
  }


  handleCategoryDeleted(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
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
  handleCategoryEdit(id: number): void {
    this.categoryService.getCategoryById(id).subscribe({
      next: (category: Category) => {
        if (category) {
          this.modalService.showEditCategory(category);
        }
      },
      error: (error) => {
        console.error('Error fetching category:', error);
      }
    });
  }
}
