import { Component, inject, output } from '@angular/core';
import { ModalService } from '../../services/modal/modal';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  newCategory: FormGroup;
  newTask: FormGroup;
  private categoryService = inject(CategoryService); // Inject the service


  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.newCategory = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]]
    });
    this.newTask = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      status: ['', [Validators.required]],
      due: ['', [Validators.required]]
    })
  }

  onSubmit() {
    if (this.newCategory.valid) {
      const formData: Category = {
        ...this.newCategory.value,
        tasks: []
      };

      this.categoryService.createNewCategory(formData).subscribe({
        next: (response) => {
          this.modalService.closeModal();
          this.newCategory.reset();
        },
        error: (err) => {
          console.error('Error creating category:', err);
        }
      });
    } else {
      console.log('Form is invalid - Errors:', this.newCategory.errors);
      console.log('Title errors:', this.newCategory.get('title')?.errors);
      console.log('Message errors:', this.newCategory.get('message')?.errors);
    }
  }
}
