import { Component } from "@angular/core";
import { CategoryCard } from "../../components/category-card/category-card";
import { Category } from "../../models/category.model";
import { CategoryService } from "../../services/category";
import { ModalService } from "../../services/modal/modal";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CategoryCard],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    public modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });

    this.categoryService.getCategories().subscribe();
  }
  onCreateCategory() {
    this.modalService.showAddCategory();
  }
  onCreateTask() {
    this.modalService.showAddTask();
  }

  handleCategoryDeleted(id: number) {
    this.categoryService.deleteCategory(id).subscribe();
  }
  handleEdit(category: Category) {
    this.modalService.showEditCategory(category);
  }

}
