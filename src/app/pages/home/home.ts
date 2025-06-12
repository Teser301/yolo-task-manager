import { Component, DestroyRef, inject } from "@angular/core";
import { CategoryCard } from "../../components/category-card/category-card";
import { Category } from "../../models/category.model";
import { CategoryService } from "../../services/category/category";
import { ModalService } from "../../services/modal/modal";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TaskService } from "../../services/task/task";
import { Search } from "../../components/search/search";
import { combineLatest } from "rxjs";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoryCard, Search],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchTerm: string = '';

  private destroyRef = inject(DestroyRef);
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  public modalService = inject(ModalService);

  constructor() { }

  ngOnInit(): void {
    this.initializeData();
    this.subscribeToFilteredData();
  }

  private initializeData(): void {
    // Only load categories if they haven't been loaded yet
    if (!this.categoryService.hasLoadedCategories) {
      this.categoryService.loadCategories().subscribe({
        error: (err) => console.error('Failed to fetch categories', err)
      });
    }
  }

  private subscribeToFilteredData(): void {
    // Subscribe to ALL categories (for backup/reference)
    combineLatest([
      this.categoryService.allCategories$,
      this.taskService.tasks$

    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([categories, tasks]) => {
        this.categories = categories.map(category => ({
          ...category,
          tasks: tasks.filter(task => task.category_id === category.id)
        }));
      });

    // Subscribe to FILTERED categories (main display)
    combineLatest([
      this.categoryService.categories$, // Changed from filteredCategories$ to categories$
      this.taskService.tasks$
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([filteredCategories, tasks]) => {
        // Map filtered categories with their tasks
        const categoriesWithTasks = filteredCategories.map(category => ({
          ...category,
          tasks: tasks.filter(task => task.category_id === category.id)
        }));

        // Apply search and sort on the filtered set
        this.filteredCategories = this.filterAndSortCategories(
          categoriesWithTasks,
          this.searchTerm,
          'title'
        );
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

  // SIMPLIFIED: Task deletion is now handled by the service optimistically
  // The subscription will automatically update the UI
  handleTaskDeleted(event: { taskId: number, categoryId: number }) {
    this.taskService.deleteTask(event.taskId).subscribe({
      error: (err) => {
        console.error('Failed to delete task', err);
        alert('Could not delete task. Please try again.');
      }
    });
  }

  onSearch(event: SearchEvent) {
    this.searchTerm = event.term;

    // Re-apply search/sort to current filtered categories
    combineLatest([
      this.categoryService.categories$,
      this.taskService.tasks$
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([filteredCategories, tasks]) => {
        const categoriesWithTasks = filteredCategories.map(category => ({
          ...category,
          tasks: tasks.filter(task => task.category_id === category.id)
        }));

        this.filteredCategories = this.filterAndSortCategories(
          categoriesWithTasks,
          event.term,
          event.sortBy
        );
      });
  }

  private filterAndSortCategories(
    categories: Category[],
    term: string,
    sortBy: 'title' | 'nameReverse' | 'taskCount' | 'taskCountReverse'
  ): Category[] {
    // Filter first
    const filtered = term
      ? categories
        .map(category => {
          const categoryMatches = category.title.toLowerCase().includes(term);
          let filteredTasks;

          if (categoryMatches) {
            filteredTasks = category.tasks ?? [];
          } else {
            filteredTasks = (category.tasks ?? []).filter(task =>
              task.title.toLowerCase().includes(term) ||
              (task.description && task.description.toLowerCase().includes(term))
            ); // This parenthesis was missing
          }

          return {
            ...category,
            tasks: filteredTasks
          };
        })
        .filter(category =>
          category.title.toLowerCase().includes(term) ||
          (category.tasks && category.tasks.length > 0)
        )
      : categories;

    // Then sort (applies to all cases)
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'nameReverse':
          return b.title.localeCompare(a.title);
        case 'taskCount':
          return (b.tasks?.length || 0) - (a.tasks?.length || 0);
        case 'taskCountReverse':
          return (a.tasks?.length || 0) - (b.tasks?.length || 0);
        default:
          return a.title.localeCompare(b.title); // Default case
      }
    });
  }
}