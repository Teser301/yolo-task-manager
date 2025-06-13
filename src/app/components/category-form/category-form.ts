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
  categoryForm: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  private categoryService = inject(CategoryService);

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.modalService.modalCategory$.subscribe(category => {
      if (category && this.modalService.modalType === 'edit') {
        this.categoryForm.patchValue({
          title: category.title,
          description: category.description
        });
      } else if (this.modalService.modalType === 'add') {
        this.categoryForm.reset();
      }
    });
  }
  onSubmit() {
    if (this.categoryForm.valid) {
      this.errorMessage = null;
      if (this.modalService.modalType === 'add') {
        this.createCategory();
      } else {
        this.editCategory();
      }
    } else {
      console.log('Form is invalid - Errors:', this.categoryForm.errors);
      this.errorMessage = 'Please fill all required inputs';
    }
  }
  // Create Category
  private createCategory() {
    this.isSubmitting = true;
    const formData: Category = {
      ...this.categoryForm.value,
      tasks: []
    };

    this.categoryService.createNewCategory(formData).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError('creating', err)
    });
  }
  // Edit Category
  private editCategory() {
    const currentCategory = this.modalService.getCurrentModalCategory();

    if (!currentCategory) return;
    const formData: Category = {
      ...currentCategory,
      ...this.categoryForm.value
    };

    this.categoryService.editCategory(currentCategory.id, formData).subscribe({
      next: () => {
        this.modalService.closeModal();
        this.categoryForm.reset();
      },
      error: (err) => {
        this.errorMessage = 'Failed to create category. Please try again.';
        console.error('Error editing category:', err)
      }

    });
  }

  private handleSuccess() {
    this.isSubmitting = false;
    this.modalService.closeModal();
    this.categoryForm.reset();

  }

  private handleError(action: string, err: any) {
    this.isSubmitting = false;
    if (err.status === 400) {
      this.errorMessage = 'A category with this name already exists';
    } else {
      this.errorMessage = 'Failed to create category. Please try again.';
      console.error('Error creating category:', err);
    }
  }
}
