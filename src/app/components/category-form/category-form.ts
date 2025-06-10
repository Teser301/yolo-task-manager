import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../services/modal/modal';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category/category';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm {
  newCategory: FormGroup;
  editCategory: FormGroup;
  isSubmitting: boolean = false;
  private categoryService = inject(CategoryService);

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.newCategory = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]]
    });
    this.editCategory = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.modalService.modalCategory$.subscribe(category => {
      if (category && this.modalService.modalType === 'edit') {
        this.editCategory.patchValue({
          title: category.title,
          description: category.description
        });
      }
    });
  }
  // Create Category
  onCreateSubmit() {
    if (this.newCategory.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData: Category = {
        ...this.newCategory.value,
        tasks: []
      };

      this.categoryService.createNewCategory(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.modalService.closeModal();
          this.newCategory.reset();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error creating category:', err);
        }
      });
    } else {
      console.log('Form is invalid - Errors:', this.newCategory.errors);
      console.log('Title errors:', this.newCategory.get('title')?.errors);
      console.log('Message errors:', this.newCategory.get('message')?.errors);
    }
  }
  // Edit Category
  onEditSubmit() {
    if (this.editCategory.valid) {
      const currentCategory = this.modalService.getCurrentModalCategory();

      if (!currentCategory) return;
      const formData: Category = {
        ...currentCategory,
        ...this.editCategory.value
      };

      this.categoryService.editCategory(currentCategory.id, formData).subscribe({
        next: () => {
          this.modalService.closeModal();
          this.editCategory.reset();
        },
        error: (err) => console.error('Error editing category:', err)
      });
    }
  }
}
