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
      if (this.modalService.modalType === 'add') {
        this.createCategory();
      } else {
        this.editCategory();
      }
    } else {
      console.log('Form is invalid - Errors:', this.categoryForm.errors);
    }
  }
  // Create Category
  createCategory() {
    this.isSubmitting = true;
    const formData: Category = {
      ...this.categoryForm.value,
      tasks: []
    };

    this.categoryService.createNewCategory(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.modalService.closeModal();
        this.categoryForm.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating category:', err);
      }
    });

  }
  // Edit Category
  editCategory() {
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
      error: (err) => console.error('Error editing category:', err)
    });
  }
}
