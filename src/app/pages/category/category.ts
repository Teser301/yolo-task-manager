import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';
import { TaskCard } from '../../components/task-card/task-card';
import { ModalService } from '../../services/modal/modal';
import { TaskService } from '../../services/task/task';
import { Task } from '../../models/task.model';
import { Search } from '../../components/search/search';
import { Icon } from "../../components/icon/icon";


@Component({
  selector: 'app-category',
  imports: [RouterLink, Search, TaskCard, Icon],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class CategoryView implements OnInit {
  category: Category | undefined;
  loading: boolean = false;
  filteredTasks: Task[] = [];
  searchTerm: string = '';
  destroyRef: DestroyRef | undefined;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private taskService = inject(TaskService);
  private modalService = inject(ModalService);

  ngOnInit() {
    const id = Number(this.route.parent?.snapshot.paramMap.get('categoryId'));
    this.loadCategory(id);

    // Listen for category updates
    this.categoryService.category$.subscribe(updatedId => {
      if (updatedId === id) {
        this.loadCategory(id);
      }
    });

    // Listen for task updates
    this.taskService.tasks$.subscribe(allTasks => {
      if (!this.category) return;

      const categoryTasks = allTasks.filter(t => t.category_id === this.category?.id);
      const mergedTasks = this.mergeTaskLists(this.category.tasks, categoryTasks);

      if (!this.areTaskListsEqual(this.category.tasks, mergedTasks)) {
        // Create a new array reference to trigger change detection
        this.category.tasks = [...mergedTasks];

        // Update filteredTasks with proper sorting
        this.filteredTasks = this.sortTasks(
          [...mergedTasks],
          this.searchTerm,
        );
      }
    });
  }

  private mergeTaskLists(existing: Task[], updated: Task[]): Task[] {
    const result = [...existing];

    updated.forEach(updatedTask => {
      const existingIndex = result.findIndex(t => t.id === updatedTask.id);
      if (existingIndex >= 0) {
        result[existingIndex] = updatedTask;
      } else {
        result.push(updatedTask);
      }
    });

    return result;
  }

  private areTaskListsEqual(a: Task[], b: Task[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((task, index) => task.id === b[index]?.id &&
      JSON.stringify(task) === JSON.stringify(b[index]));
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.category = category;
        this.loading = false;

        // Initialize filteredTasks to all tasks in the category
        this.filteredTasks = category.tasks ?? [];
      },
      error: (err) => {
        console.error('Failed to load category:', err);
        this.loading = false;
      }
    });
  }
  // Handlers for tasks
  handleTaskAdd(id: number): void {
    this.modalService.showAddTask(id);
  }
  handleTaskDeleted(deletedTaskId: number): void {
    if (!this.category) return;

    // Optimistically update both task lists
    this.category.tasks = this.category.tasks.filter(task => task.id !== deletedTaskId);
    this.filteredTasks = this.filteredTasks.filter(task => task.id !== deletedTaskId);

    // Optional: Force UI update if needed
    this.filteredTasks = [...this.filteredTasks]; // Create new array reference
  }
  // Handlers for categories
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
  onSearch(event: SearchEvent) {
    this.searchTerm = event.term;

    if (!this.category) return;

    // Filter tasks in the current category
    const filtered = (this.category.tasks ?? []).filter(task =>
      task.title.toLowerCase().includes(event.term) ||
      (task.description && task.description.toLowerCase().includes(event.term))
    );

    // Sort the filtered tasks according to event.sortBy
    this.filteredTasks = this.sortTasks(filtered, event.sortBy);
  }
  private sortTasks(tasks: Task[], sortBy: string): Task[] {
    switch (sortBy) {
      case 'taskStatusAsc':  // Low → High (1, 2, 3...)
        return [...tasks].sort((a, b) => a.status - b.status);

      case 'taskStatusDesc': // High → Low (3, 2, 1...)
        return [...tasks].sort((a, b) => b.status - a.status);
      case 'taskDateAsc':
        return [...tasks].sort((a, b) => {
          if (!a.due) return 1;
          if (!b.due) return -1;
          return new Date(a.due).getTime() - new Date(b.due).getTime();
        });

      case 'taskDateDesc':
        return [...tasks].sort((a, b) => {
          if (!a.due) return 1;
          if (!b.due) return -1;
          return new Date(b.due).getTime() - new Date(a.due).getTime();
        });

      case 'title':
        return [...tasks].sort((a, b) => a.title.localeCompare(b.title));

      case 'nameReverse':
        return [...tasks].sort((a, b) => b.title.localeCompare(a.title));

      default:
        return tasks;
    }
  }

}
