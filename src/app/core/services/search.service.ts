import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  readonly searchTerm = signal<string>('');

  setSearchTerm(term: string) {
    this.searchTerm.set(term);
  }
}
