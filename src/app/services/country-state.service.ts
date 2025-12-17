import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SelectedCountry {
  name: string;
  code: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryStateService {
  private readonly STORAGE_KEY = 'selectedCountry';
  
  private selectedCountrySubject = new BehaviorSubject<SelectedCountry | null>(null);
  public selectedCountry$: Observable<SelectedCountry | null> = this.selectedCountrySubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  setSelectedCountry(country: SelectedCountry): void {
    try {
      const countryData = {
        ...country,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(countryData));
      this.selectedCountrySubject.next(countryData);
      
      console.log('✅ Country saved:', country.name);
    } catch (error) {
      console.error('❌ Error saving country:', error);
    }
  }

  getSelectedCountry(): SelectedCountry | null {
    return this.selectedCountrySubject.value;
  }

  clearSelectedCountry(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.selectedCountrySubject.next(null);
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      
      if (saved) {
        const country = JSON.parse(saved) as SelectedCountry;
        this.selectedCountrySubject.next(country);
        console.log('📥 Loaded saved country:', country.name);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  hasSelectedCountry(): boolean {
    return this.selectedCountrySubject.value !== null;
  }
}