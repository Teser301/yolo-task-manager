import { Component, inject } from '@angular/core';
import { Task } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../services/category/category';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.scss'
})

export class TaskView {

  task: Task | undefined;
  category: Category | undefined;

  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const categoryId = Number(
      this.route.parent?.snapshot.paramMap.get('categoryId')
    );
    const taskId = Number(
      this.route.snapshot.paramMap.get('taskId')
    );
    if (categoryId && taskId) {
      this.loadTask(categoryId, taskId);
    }
  }
  private loadTask(categoryId: number, taskId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        this.task = category.tasks.find(task => task.id === taskId);
      },
      error: (err) => {
        console.error('Failed to load category:', err);
      }
    });
  }
  onDeleteTask(): void {
    // if (!this.category || !this.task) return;

    // if (confirm('Are you sure you want to delete this task?')) {
    //   this.categoryService.deleteTask(this.category.id, this.task.id);
    //   this.router.navigate(['/category', this.category.id]); // Redirect back to category
    // }
  }
  returnToCategory() {
    const categoryId = this.route.parent?.snapshot.paramMap.get('categoryId');
    this.router.navigate(['/category', categoryId]);
  }
}