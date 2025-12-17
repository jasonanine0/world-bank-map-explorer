import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
          placeholder="Search countries by name, region, or income level..."
          class="search-input"
        />
        <button 
          *ngIf="searchQuery"
          (click)="clearSearch()"
          class="clear-btn"
        >
          ×
        </button>
      </div>
      
      <div class="filter-chips">
        <button 
          *ngFor="let region of regions"
          (click)="filterByRegion(region)"
          [class.active]="selectedRegion === region"
          class="filter-chip"
        >
          {{ region }}
        </button>
      </div>
      
      <div *ngIf="searchQuery || selectedRegion" class="results-info">
        <span>{{ resultsCount }} countries found</span>
        <button (click)="clearAll()" class="clear-all-btn">Clear all filters</button>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      width: 20px;
      height: 20px;
      color: #6b7280;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 12px 48px 12px 48px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .clear-btn {
      position: absolute;
      right: 12px;
      background: #e5e7eb;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .clear-btn:hover {
      background: #d1d5db;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .filter-chip {
      padding: 8px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 20px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .filter-chip:hover {
      border-color: #6366f1;
      background: #f5f3ff;
    }

    .filter-chip.active {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
    }

    .results-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    .clear-all-btn {
      background: none;
      border: none;
      color: #6366f1;
      cursor: pointer;
      font-size: 14px;
      text-decoration: underline;
    }

    .clear-all-btn:hover {
      color: #4f46e5;
    }

    @media (max-width: 768px) {
      .search-container {
        padding: 16px;
      }

      .filter-chips {
        overflow-x: auto;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
      }

      .filter-chip {
        white-space: nowrap;
      }
    }
  `]
})
export class SearchComponent {
  @Output() searchChange = new EventEmitter<string>();
  @Output() regionChange = new EventEmitter<string>();

  searchQuery: string = '';
  selectedRegion: string = '';
  resultsCount: number = 0;

  regions = [
    'All Regions',
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania'
  ];

  onSearch() {
    this.searchChange.emit(this.searchQuery);
  }

  filterByRegion(region: string) {
    if (region === 'All Regions') {
      this.selectedRegion = '';
      this.regionChange.emit('');
    } else {
      this.selectedRegion = region;
      this.regionChange.emit(region);
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchChange.emit('');
  }

  clearAll() {
    this.searchQuery = '';
    this.selectedRegion = '';
    this.searchChange.emit('');
    this.regionChange.emit('');
  }
}