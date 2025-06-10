import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  showCategoryModal = false
  showTaskModal = false
  modalType: 'edit' | 'add' | null = null;

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
    console.log('Edit modal opened');
  }

  showAddCategory() {
    this.modalType = 'add';
    this.showCategoryModal = true;
    console.log('Add modal opened');
  }
  // Handle Tasks
  showEditTask() {
    this.modalType = 'edit';
    this.showTaskModal = true;
    console.log('Edit modal opened');
  }
  showAddTask() {
    this.modalType = 'add';
    this.showTaskModal = true;
    console.log('Add modal opened');
  }
  // Shared
  closeModal() {
    this.showCategoryModal = false;
    this.modalType = null;
    this.modalCategorySubject.next(null);
    console.log('Modal closed');
  }
  constructor() { }

}
