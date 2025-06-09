import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  showCategoryModal = false
  showTaskModal = false
  modalType: 'edit' | 'add' | null = null;

  // Handle Categories
  showEditCategory() {
    this.modalType = 'edit';
    this.showCategoryModal = true;
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
    console.log('Modal closed');
  }
  constructor() { }

}
