import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { ModalService } from '../../services/modal/modal';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskForm {
  newTask: FormGroup;
  private categoryService = inject(CategoryService); // Inject the service

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.newTask = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required]],
      status: ['', [Validators.required]],
      due: ['', [Validators.required]]
    })
  }
}
