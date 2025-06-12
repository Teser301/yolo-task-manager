type SortOption = 'title' | 'nameReverse' | 'taskCount' | 'taskCountReverse';

interface SearchFormValue {
    searchTerm: string | null;
    sortBy: SortOption | null;
}

interface SearchEvent {
    term: string;
    sortBy: SortOption;
}