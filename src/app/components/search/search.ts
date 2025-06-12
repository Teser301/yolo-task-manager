import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';


@Component({
  selector: 'app-search',
  imports: [ReactiveFormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})

export class Search {
  private fb = inject(FormBuilder);
  searchMode = input<'category' | 'task'>('category');
  searchChanged = output<SearchEvent>();

  searchForm = this.fb.group({
    searchTerm: this.fb.control<string>(''),
    sortBy: this.fb.control<SortOption>('title')
  });

  constructor() {
    const initialSearchTerm = this.searchForm.value.searchTerm ?? '';
    const initialSortBy = this.searchForm.value.sortBy ?? 'title';
    this.searchChanged.emit({
      term: initialSearchTerm.toLowerCase(),
      sortBy: initialSortBy
    });

    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) =>
          prev.searchTerm === curr.searchTerm &&
          prev.sortBy === curr.sortBy
        )
      )
      .subscribe(value => {
        const searchTerm = value.searchTerm ?? '';
        const sortBy = value.sortBy ?? 'title';

        this.searchChanged.emit({
          term: searchTerm.toLowerCase(),
          sortBy
        });
      });
  }
}