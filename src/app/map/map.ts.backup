import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { WorldBank, CountryInfo } from '../services/world-bank';

@Component({
  selector: 'app-map',
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements OnInit {
  svgContent: SafeHtml = '';
  selectedCountry: CountryInfo | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // LocalStorage key for persistence
  private readonly STORAGE_KEY = 'selectedCountry';
  private readonly SELECTED_COUNTRY_CODE_KEY = 'selectedCountryCode';
  
  // Track currently selected path element
  private selectedPath: SVGPathElement | null = null;
  
  // Colors
  private readonly DEFAULT_COLOR = '#ddd';
  private readonly HOVER_COLOR = '#4CAF50';
  private readonly SELECTED_COLOR = '#2196F3'; // Blue for selected

  constructor(
    private worldBankService: WorldBank,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadSvgMap();
    // Load previously selected country from localStorage
    this.loadSelectedCountryFromStorage();
  }

  /**
   * Loads the SVG map from assets and sanitizes it for safe rendering
   */
  loadSvgMap(): void {
    this.http.get('assets/map-image.svg', { responseType: 'text' })
      .subscribe({
        next: (svgData) => {
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgData);
          // Wait for Angular to render the SVG before attaching listeners
          setTimeout(() => {
            this.attachEventListeners();
            // Restore visual selection after SVG loads
            this.restoreVisualSelection();
          }, 100);
        },
        error: (error) => {
          console.error('Error loading SVG map:', error);
          this.errorMessage = 'Failed to load map. Please refresh the page.';
        }
      });
  }

  /**
   * Attaches click event listeners to all country paths in the SVG
   */
  attachEventListeners(): void {
    const mapContainer = this.elementRef.nativeElement.querySelector('.map-container');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    const svgElement = mapContainer.querySelector('svg');
    if (!svgElement) {
      console.error('SVG element not found');
      return;
    }

    const countryPaths = svgElement.querySelectorAll('path[id]');
    console.log(`Found ${countryPaths.length} country paths`);

    countryPaths.forEach((path: Element) => {
      const svgPath = path as SVGPathElement;
      
      // Use Renderer2 for better Angular integration
      this.renderer.listen(svgPath, 'click', (event: Event) => this.onCountryClick(event));
      
      this.renderer.listen(svgPath, 'mouseenter', (event: Event) => {
        const target = event.target as SVGPathElement;
        // Only change color on hover if it's not the selected country
        if (target !== this.selectedPath) {
          this.renderer.setStyle(target, 'fill', this.HOVER_COLOR);
        }
        this.renderer.setStyle(target, 'cursor', 'pointer');
      });
      
      this.renderer.listen(svgPath, 'mouseleave', (event: Event) => {
        const target = event.target as SVGPathElement;
        // Restore to default only if it's not the selected country
        if (target !== this.selectedPath) {
          this.renderer.setStyle(target, 'fill', this.DEFAULT_COLOR);
        }
      });
    });
  }

  /**
   * Handles click events on country paths in the SVG map
   * Triggers the service method to fetch country information
   * Saves selected country to localStorage and highlights it
   * @param event Mouse click event from the SVG path element
   */
  onCountryClick(event: Event): void {
    const target = event.target as SVGPathElement;
    const countryCode = target.getAttribute('id');
    
    console.log('Country clicked:', countryCode);
    
    if (countryCode) {
      // Reset previous selection color
      if (this.selectedPath) {
        this.renderer.setStyle(this.selectedPath, 'fill', this.DEFAULT_COLOR);
      }
      
      // Set new selection
      this.selectedPath = target;
      this.renderer.setStyle(this.selectedPath, 'fill', this.SELECTED_COLOR);
      
      // Save selected country code for visual restoration
      localStorage.setItem(this.SELECTED_COUNTRY_CODE_KEY, countryCode);
      
      this.isLoading = true;
      this.errorMessage = '';
      
      // Call the service method to get country information
      this.worldBankService.getCountryInfo(countryCode).subscribe({
        next: (countryInfo) => {
          this.selectedCountry = countryInfo;
          this.isLoading = false;
          
          // Save selected country to localStorage
          this.saveSelectedCountryToStorage(countryInfo);
          
          console.log('✅ Country loaded and saved:', countryInfo.name);
        },
        error: (error) => {
          console.error('Error fetching country data:', error);
          this.errorMessage = 'Failed to load country information. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  /**
   * Saves selected country to localStorage for persistence
   * @param country The country info to save
   */
  private saveSelectedCountryToStorage(country: CountryInfo): void {
    try {
      const countryData = {
        ...country,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(countryData));
      console.log('💾 Saved to localStorage:', country.name);
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }

  /**
   * Loads previously selected country from localStorage on page load
   */
  private loadSelectedCountryFromStorage(): void {
    try {
      const savedCountry = localStorage.getItem(this.STORAGE_KEY);
      
      if (savedCountry) {
        const country = JSON.parse(savedCountry);
        
        // Check if saved data is less than 7 days old
        const savedDate = new Date(country.savedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7) {
          this.selectedCountry = country;
          console.log('📥 Loaded saved country:', country.name);
        } else {
          // Clear old data
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem(this.SELECTED_COUNTRY_CODE_KEY);
          console.log('🗑️ Cleared old saved country data');
        }
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SELECTED_COUNTRY_CODE_KEY);
    }
  }

  /**
   * Restores the visual selection (blue color) on the SVG after page reload
   */
  private restoreVisualSelection(): void {
    try {
      const savedCountryCode = localStorage.getItem(this.SELECTED_COUNTRY_CODE_KEY);
      
      if (savedCountryCode) {
        const mapContainer = this.elementRef.nativeElement.querySelector('.map-container');
        if (!mapContainer) return;

        const svgElement = mapContainer.querySelector('svg');
        if (!svgElement) return;

        // Find the path with matching country code
        const countryPath = svgElement.querySelector(`path[id="${savedCountryCode}"]`);
        
        if (countryPath) {
          this.selectedPath = countryPath as SVGPathElement;
          this.renderer.setStyle(this.selectedPath, 'fill', this.SELECTED_COLOR);
          console.log('🎨 Restored visual selection for:', savedCountryCode);
        }
      }
    } catch (error) {
      console.error('Error restoring visual selection:', error);
    }
  }

  /**
   * Clears the selected country and resets visual selection
   */
  clearSelection(): void {
    // Reset visual selection
    if (this.selectedPath) {
      this.renderer.setStyle(this.selectedPath, 'fill', this.DEFAULT_COLOR);
      this.selectedPath = null;
    }
    
    // Clear data
    this.selectedCountry = null;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SELECTED_COUNTRY_CODE_KEY);
    
    console.log('🗑️ Selection cleared');
  }
}