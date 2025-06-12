import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal/modal';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task/task';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskForm implements OnInit {
  taskForm: FormGroup;
  categories: Category[] = [];
  private categoriesSubscription?: Subscription;

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      status: [1, [Validators.required]],
      due: [this.getToday(), [Validators.required]],
      category_id: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.subscribeToCategories();
    this.checkForEditMode();
    this.setPreselectedCategory();
  }

  ngOnDestroy() {
    if (this.categoriesSubscription) {
      this.categoriesSubscription.unsubscribe();
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      if (this.modalService.modalType === 'add') {
        this.createTask();
      } else {
        this.editTask();
      }
    } else {
      console.log('Form is invalid - Errors:', this.taskForm.errors);
    }
  }

  private createTask() {
    const formData: Task = this.taskForm.value;

    this.taskService.createNewTask(formData).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError('creating', err)
    });
  }

  // Edit
  private editTask() {
    if (!this.modalService.editingTask) return;

    const formData: Task = {
      ...this.modalService.editingTask,
      ...this.taskForm.value
    };

    this.taskService.editTask(this.modalService.editingTask.id, formData).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError('updating', err)
    });
  }

  private handleSuccess() {
    this.modalService.closeModal();
    this.resetForm();
  }

  private resetForm() {
    this.taskForm.reset({
      status: 1,
      due: this.getToday()
    });
  }

  private handleError(action: string, err: any) {
    console.error(`Error ${action} task:`, err);
    alert(`Failed to ${action} task. Please try again.`);
  }

  setPreselectedCategory() {
    if (this.modalService.modalType === 'add' && this.modalService.preselectedCategoryId) {
      this.taskForm.patchValue({
        category_id: this.modalService.preselectedCategoryId
      });
    }
  }

  // If edit, fill inputs
  checkForEditMode() {
    const { modalType, editingTask } = this.modalService;
    if (modalType === 'edit' && editingTask) {
      const formattedDate = editingTask.due
        ? new Date(editingTask.due).toISOString().split('T')[0]
        : this.getToday();

      this.taskForm.patchValue({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        due: formattedDate,
        category_id: editingTask.category_id
      });
    }
  }

  // Get today for inputs
  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // FIXED: Subscribe to the filtered categories observable instead of fetching
  private subscribeToCategories() {
    this.categoriesSubscription = this.categoryService.categories$.subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categories updated in task form:', categories.length);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });

    // Only load categories if they haven't been loaded yet
    if (!this.categoryService.hasLoadedCategories) {
      this.categoryService.loadCategories().subscribe({
        error: (err) => {
          console.error('Failed to initially load categories:', err);
        }
      });
    }
  }
}