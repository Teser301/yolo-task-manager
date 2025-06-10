import { Component, inject, OnInit } from '@angular/core';
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
export class TaskForm implements OnInit {
  newTask: FormGroup;
  editTask: FormGroup;
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
      status: [1, [Validators.required]],
      due: [this.getToday(), [Validators.required]],
      category_id: ['', [Validators.required]]
    })
    this.editTask = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      status: [1, [Validators.required]],
      due: [this.getToday(), [Validators.required]],
      category_id: ['', [Validators.required]]
    })
  }
  ngOnInit() {
    this.fetchCategories();

    // Watch for when the modal opens with edit mode
    this.checkForEditMode();
  }
  checkForEditMode() {
    // When modal opens in edit mode, populate the edit form
    if (this.modalService.modalType === 'edit' && this.modalService.editingTask) {
      this.populateEditForm(this.modalService.editingTask);
    }
  }

  populateEditForm(task: Task) {
    // Format the date for the input field
    const formattedDate = task.due ? new Date(task.due).toISOString().split('T')[0] : this.getToday();

    this.editTask.patchValue({
      title: task.title,
      description: task.description,
      status: task.status, // Convert to string for select
      due: formattedDate,
      category_id: task.category_id
    });
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

  onEditSubmit() {
    if (this.editTask.valid && this.modalService.editingTask) {
      const formData: Task = {
        ...this.modalService.editingTask,
        ...this.editTask.value,
      };

      this.taskService.editTask(this.modalService.editingTask.id, formData).subscribe({
        next: () => {
          this.modalService.closeModal();
          this.editTask.reset();
          // Reset to default values
          this.editTask.patchValue({
            status: 1,
            due: this.getToday()
          });
        },
        error: (err) => {
          console.error('Error updating task:', err);
          alert('Failed to update task. Please try again.');
        }
      });
    } else {
      // Touch all controls to trigger error messages
      Object.values(this.editTask.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
