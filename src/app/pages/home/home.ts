import { Component, DestroyRef, inject } from "@angular/core";
import { CategoryCard } from "../../components/category-card/category-card";
import { Category } from "../../models/category.model";
import { CategoryService } from "../../services/category/category";
import { ModalService } from "../../services/modal/modal";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoryCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  categories: Category[] = [];
  private destroyRef = inject(DestroyRef);

  constructor(
    private categoryService: CategoryService,
    public modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.allCategories$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (err) => {
          console.error('Failed to load categories', err);
        }
      });
    this.categoryService.getCategories().subscribe({
      error: (err) => console.error('Failed to refresh categories', err)
    });
  }

  onCreateCategory() {
    this.modalService.showAddCategory();
  }

  onCreateTask() {
    if (this.categories.length === 0) {
      console.warn('No categories exist - this button should be hidden');
      return;
    }
    this.modalService.showAddTask();
  }

  handleCategoryDeleted(id: number): void {
    this.categoryService.deleteCategory(id).subscribe({
      error: (err) => {
        console.error('Failed to delete category', err);
        alert('Could not delete category. Please try again.');
      }
    });
  }

  handleCategoryEdit(category: Category) {
    this.modalService.showEditCategory(category);
  }

  handleTaskDeleted(event: { taskId: number, categoryId: number }) {
    this.categories = this.categories.map(category => {
      if (category.id === event.categoryId) {
        return {
          ...category,
          tasks: category.tasks?.filter(task => task.id !== event.taskId) || []
        };
      }
      return category;
    });
  }
}
