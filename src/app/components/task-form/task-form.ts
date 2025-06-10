import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal/modal';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task/task';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskForm {
  newTask: FormGroup;
  categories: Category[] = [];

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.newTask = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      status: ['1', [Validators.required]],
      due: [this.getToday(), [Validators.required]],
      category_id: ['', [Validators.required]]
    })
    this.fetchCategories(); // <- Fetch categories here
  }
  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  fetchCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  onCreateSubmit() {
    if (this.newTask.valid) {
      const formData: Task = {
        ...this.newTask.value,
      };

      this.taskService.createNewTask(formData).subscribe({
        next: () => {
          this.modalService.closeModal();
          this.newTask.reset();
        },
        error: (err) => {
          console.error('Error creating task:', err);
        }
      });
    } else {
      // Touch all controls to trigger error messages
      Object.values(this.newTask.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

}
