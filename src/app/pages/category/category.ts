import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';
import { TaskCard } from '../../components/task-card/task-card';
import { ModalService } from '../../services/modal/modal';
import { TaskService } from '../../services/task/task';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-category',
  imports: [RouterLink, TaskCard],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class CategoryView implements OnInit {
  category: Category | undefined;
  loading: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private taskService = inject(TaskService);
  private modalService = inject(ModalService);

  ngOnInit() {
    // Get category ID from url
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
        this.category.tasks = mergedTasks;
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
      },
      error: (err) => {
        console.error('Failed to load category:', err);
        this.loading = false;
      }
    });
  }


  updateTaskInCategory(updatedTask: Task): void {
    if (!this.category) return;
    const index = this.category.tasks.findIndex(t => t.id === updatedTask.id);
    if (index >= 0) {
      // Update existing task

      this.category.tasks[index] = updatedTask;
    } else {
      // Add new task
      console.log(this.category.tasks)
      this.category.tasks.push(updatedTask);
    }

    this.category.tasks.sort((a, b) => a.id - b.id);
  }
  handleTaskAdd(id: number): void {
    this.modalService.showAddTask(id);
  }
  handleTaskDeleted(deletedTaskId: number): void {
    if (!this.category) return;

    // Remove the deleted task from the category's task list
    this.category.tasks = this.category.tasks.filter(task => task.id !== deletedTaskId);
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
