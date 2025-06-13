import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal/modal';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task/task';
import { CategoryService } from '../../services/category/category';
import { Category } from '../../models/category.model';
import { Subscription } from 'rxjs';
import { Icon } from "../icon/icon";

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskForm implements OnInit {
  taskForm: FormGroup;
  categories: Category[] = [];
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  private categoriesSubscription?: Subscription;

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private categoryService: CategoryService
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

    if (!this.categoryService.hasLoadedCategories) {
      this.categoryService.loadCategories().subscribe({
        error: (err) => {
          console.error('Failed to initially load categories:', err);
        }
      });
    }
  }
  private checkForEditMode() {
    const { modalType, editingTask } = this.modalService;
    if (modalType === 'edit' && editingTask) {
      const date = new Date(editingTask.due);
      const formattedDate = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');

      this.taskForm.patchValue({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        due: formattedDate,
        category_id: editingTask.category_id
      });
    }
  }
  private setPreselectedCategory() {
    if (this.modalService.modalType === 'add' && this.modalService.preselectedCategoryId) {
      this.taskForm.patchValue({
        category_id: this.modalService.preselectedCategoryId
      });
    }
  }


  onSubmit() {
    if (this.taskForm.valid) {
      this.errorMessage = null;
      if (this.modalService.modalType === 'add') {
        this.createTask();
      } else {
        this.editTask();
      }
    } else {
      console.log('Form is invalid - Errors:', this.taskForm.errors);
      this.errorMessage = 'Please fill all required inputs';
    }
  }


  // Create
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

  //// Helpers
  // Get today for inputs
  private getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  private handleSuccess() {
    this.modalService.closeModal();
    this.resetForm();
  }
  private handleError(action: string, err: any) {
    this.isSubmitting = false;
    if (err.status === 400) {
      this.errorMessage = 'A task with this name already exists';
    } else {
      this.errorMessage = 'Failed to create task. Please try again.';
      console.error('Error creating task:', err);
    }
  }
  private resetForm() {
    this.taskForm.reset({
      status: 1,
      due: this.getToday()
    });
  }
}