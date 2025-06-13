import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../models/category.model';
import { Task } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  showCategoryModal = false
  showTaskModal = false
  modalType: 'edit' | 'add' | null = null;
  editingTask: Task | null = null;
  preselectedCategoryId: number | null = null;

  private modalCategorySubject = new BehaviorSubject<Category | null>(null);
  public modalCategory$ = this.modalCategorySubject.asObservable();

  getCurrentModalCategory(): Category | null {
    return this.modalCategorySubject.value;
  }
  // Handle Categories
  showEditCategory(category?: Category) {
    this.modalType = 'edit';
    this.showCategoryModal = true;
    if (category) {
      this.modalCategorySubject.next(category);
    }
    console.log('Edit Category modal opened');
  }

  showAddCategory() {
    this.modalType = 'add';
    this.showCategoryModal = true;
    console.log('Add Category modal opened');
  }
  // Handle Tasks
  showEditTask(task: Task) {
    this.editingTask = task;
    this.modalType = 'edit';
    this.showTaskModal = true;
    console.log('Edit Task modal opened');
  }
  showAddTask(categoryId?: number) {
    this.modalType = 'add';
    this.showTaskModal = true;
    this.preselectedCategoryId = categoryId || null;
    console.log('Add Task modal opened');
  }
  // Shared
  closeModal() {
    this.showCategoryModal = false;
    this.showTaskModal = false;
    this.modalType = null;
    this.modalCategorySubject.next(null);
    console.log('Modal closed');
  }
  constructor() { }

}
