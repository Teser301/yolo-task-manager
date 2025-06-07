import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all categories', () => {
    const categories = service.getCategories();
    expect(categories.length).toBe(2);
  });

  it('should return a category by ID', () => {
    const category = service.getCategory(1);
    expect(category?.title).toBe('Work');
  });

  it('should delete a category', () => {
    const success = service.deleteCategory(1);
    expect(success).toBeTrue();
    expect(service.getCategories().length).toBe(1);
  });
});