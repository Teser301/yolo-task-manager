import { Component, HostListener } from '@angular/core';
import { ModalService } from '../../services/modal/modal';
import { CategoryForm } from "../category-form/category-form";
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'app-modal',
  imports: [CategoryForm, TaskForm],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  constructor(public modalService: ModalService) { }

  // Press Escape to close modal
  @HostListener('document:keydown.escape')
  onKeydownHandler() {
    if (this.modalService.showCategoryModal || this.modalService.showTaskModal) {
      this.modalService.closeModal();
    }
  }
}