import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { WorldBank, CountryInfo } from '../services/world-bank';
import { SearchComponent } from '../search/search.component';
import { LoadingComponent } from '../loading/loading.component';
import { ErrorComponent } from '../error/error.component';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-map',
  imports: [
    CommonModule, 
    SearchComponent, 
    LoadingComponent, 
    ErrorComponent,
    ChartComponent
  ],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map implements OnInit {
  svgContent: SafeHtml = '';
  selectedCountry: CountryInfo | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;

  searchQuery: string = '';
  selectedRegion: string = '';
  
  chartData: any = null;
  showChart: boolean = false;

  private readonly STORAGE_KEY = 'selectedCountry';
  private readonly SELECTED_COUNTRY_CODE_KEY = 'selectedCountryCode';
  private selectedPath: SVGPathElement | null = null;

  private readonly DEFAULT_COLOR = '#ddd';
  private readonly HOVER_COLOR = '#4CAF50';
  private readonly SELECTED_COLOR = '#2196F3';

  private readonly COUNTRY_NAMES: { [key: string]: string } = {
    'us': 'United States', 'ca': 'Canada', 'mx': 'Mexico', 'br': 'Brazil', 'ar': 'Argentina',
    'gb': 'United Kingdom', 'fr': 'France', 'de': 'Germany', 'it': 'Italy', 'es': 'Spain',
    'ru': 'Russia', 'cn': 'China', 'in': 'India', 'jp': 'Japan', 'au': 'Australia',
    'za': 'South Africa', 'ng': 'Nigeria', 'eg': 'Egypt', 'ke': 'Kenya', 'et': 'Ethiopia',
    'gh': 'Ghana', 'ao': 'Angola', 'tz': 'Tanzania', 'ug': 'Uganda', 'ma': 'Morocco',
    'dz': 'Algeria', 'sd': 'Sudan', 'cm': 'Cameroon', 'ne': 'Niger', 'bf': 'Burkina Faso',
    'ml': 'Mali', 'mw': 'Malawi', 'zm': 'Zambia', 'sn': 'Senegal', 'so': 'Somalia',
    'td': 'Chad', 'gn': 'Guinea', 'rw': 'Rwanda', 'bj': 'Benin', 'tn': 'Tunisia',
    'bi': 'Burundi', 'ss': 'South Sudan', 'tg': 'Togo', 'sl': 'Sierra Leone', 'ly': 'Libya',
    'lr': 'Liberia', 'mr': 'Mauritania', 'cf': 'Central African Republic', 'er': 'Eritrea',
    'gm': 'Gambia', 'bw': 'Botswana', 'na': 'Namibia', 'ga': 'Gabon', 'ls': 'Lesotho',
    'gw': 'Guinea-Bissau', 'gq': 'Equatorial Guinea', 'mu': 'Mauritius', 'sz': 'Swaziland',
    'tr': 'Turkey', 'ir': 'Iran', 'iq': 'Iraq', 'sa': 'Saudi Arabia', 'ye': 'Yemen',
    'sy': 'Syria', 'jo': 'Jordan', 'ae': 'United Arab Emirates', 'il': 'Israel', 'lb': 'Lebanon',
    'om': 'Oman', 'kw': 'Kuwait', 'qa': 'Qatar', 'bh': 'Bahrain', 'ps': 'Palestine',
    'af': 'Afghanistan', 'pk': 'Pakistan', 'bd': 'Bangladesh', 'lk': 'Sri Lanka', 'mm': 'Myanmar',
    'th': 'Thailand', 'vn': 'Vietnam', 'ph': 'Philippines', 'my': 'Malaysia', 'sg': 'Singapore',
    'id': 'Indonesia', 'kh': 'Cambodia', 'la': 'Laos', 'np': 'Nepal', 'bt': 'Bhutan',
    'kr': 'South Korea', 'kp': 'North Korea', 'mn': 'Mongolia', 'kz': 'Kazakhstan',
    'uz': 'Uzbekistan', 'tm': 'Turkmenistan', 'kg': 'Kyrgyzstan', 'tj': 'Tajikistan',
    'pl': 'Poland', 'ua': 'Ukraine', 'ro': 'Romania', 'cz': 'Czech Republic', 'gr': 'Greece',
    'pt': 'Portugal', 'hu': 'Hungary', 'by': 'Belarus', 'at': 'Austria', 'rs': 'Serbia',
    'ch': 'Switzerland', 'bg': 'Bulgaria', 'dk': 'Denmark', 'fi': 'Finland', 'sk': 'Slovakia',
    'no': 'Norway', 'ie': 'Ireland', 'hr': 'Croatia', 'ba': 'Bosnia', 'lt': 'Lithuania',
    'si': 'Slovenia', 'lv': 'Latvia', 'ee': 'Estonia', 'mk': 'Macedonia', 'al': 'Albania',
    'md': 'Moldova', 'me': 'Montenegro', 'se': 'Sweden', 'be': 'Belgium', 'nl': 'Netherlands',
    'lu': 'Luxembourg', 'nz': 'New Zealand', 'pg': 'Papua New Guinea', 'fj': 'Fiji',
    'gt': 'Guatemala', 'cu': 'Cuba', 'ht': 'Haiti', 'do': 'Dominican Republic', 'hn': 'Honduras',
    'ni': 'Nicaragua', 'sv': 'El Salvador', 'cr': 'Costa Rica', 'pa': 'Panama', 'jm': 'Jamaica',
    've': 'Venezuela', 'co': 'Colombia', 'ec': 'Ecuador', 'pe': 'Peru', 'cl': 'Chile',
    'bo': 'Bolivia', 'py': 'Paraguay', 'uy': 'Uruguay', 'gy': 'Guyana', 'sr': 'Suriname',
    'is': 'Iceland', 'gl': 'Greenland'
  };

  private readonly COUNTRY_REGIONS: { [key: string]: string } = {
    'ng': 'Africa', 'eg': 'Africa', 'za': 'Africa', 'ke': 'Africa', 'et': 'Africa',
    'gh': 'Africa', 'ao': 'Africa', 'tz': 'Africa', 'ug': 'Africa', 'ma': 'Africa',
    'dz': 'Africa', 'sd': 'Africa', 'cm': 'Africa', 'ne': 'Africa', 'bf': 'Africa',
    'ml': 'Africa', 'mw': 'Africa', 'zm': 'Africa', 'sn': 'Africa', 'so': 'Africa',
    'td': 'Africa', 'gn': 'Africa', 'rw': 'Africa', 'bj': 'Africa', 'tn': 'Africa',
    'bi': 'Africa', 'ss': 'Africa', 'tg': 'Africa', 'sl': 'Africa', 'ly': 'Africa',
    'lr': 'Africa', 'mr': 'Africa', 'cf': 'Africa', 'er': 'Africa', 'gm': 'Africa',
    'bw': 'Africa', 'na': 'Africa', 'ga': 'Africa', 'ls': 'Africa', 'gw': 'Africa',
    'gq': 'Africa', 'mu': 'Africa', 'sz': 'Africa', 'dj': 'Africa', 'km': 'Africa',
    'cv': 'Africa', 'st': 'Africa', 'sc': 'Africa',
    'cn': 'Asia', 'in': 'Asia', 'jp': 'Asia', 'af': 'Asia', 'pk': 'Asia',
    'bd': 'Asia', 'lk': 'Asia', 'mm': 'Asia', 'th': 'Asia', 'vn': 'Asia',
    'ph': 'Asia', 'my': 'Asia', 'sg': 'Asia', 'id': 'Asia', 'kh': 'Asia',
    'la': 'Asia', 'np': 'Asia', 'bt': 'Asia', 'kr': 'Asia', 'kp': 'Asia',
    'mn': 'Asia', 'kz': 'Asia', 'uz': 'Asia', 'tm': 'Asia', 'kg': 'Asia', 'tj': 'Asia',
    'gb': 'Europe', 'fr': 'Europe', 'de': 'Europe', 'it': 'Europe', 'es': 'Europe',
    'ru': 'Europe', 'pl': 'Europe', 'ua': 'Europe', 'ro': 'Europe', 'cz': 'Europe',
    'gr': 'Europe', 'pt': 'Europe', 'hu': 'Europe', 'by': 'Europe', 'at': 'Europe',
    'rs': 'Europe', 'ch': 'Europe', 'bg': 'Europe', 'dk': 'Europe', 'fi': 'Europe',
    'sk': 'Europe', 'no': 'Europe', 'ie': 'Europe', 'hr': 'Europe', 'ba': 'Europe',
    'lt': 'Europe', 'si': 'Europe', 'lv': 'Europe', 'ee': 'Europe', 'mk': 'Europe',
    'al': 'Europe', 'md': 'Europe', 'me': 'Europe', 'se': 'Europe', 'be': 'Europe',
    'nl': 'Europe', 'lu': 'Europe', 'is': 'Europe',
    'us': 'North America', 'ca': 'North America', 'mx': 'North America',
    'gt': 'North America', 'cu': 'North America', 'ht': 'North America',
    'do': 'North America', 'hn': 'North America', 'ni': 'North America',
    'sv': 'North America', 'cr': 'North America', 'pa': 'North America',
    'jm': 'North America', 'tt': 'North America', 'bs': 'North America',
    'bz': 'North America', 'bb': 'North America', 'gl': 'North America',
    'br': 'South America', 'ar': 'South America', 've': 'South America',
    'co': 'South America', 'ec': 'South America', 'pe': 'South America',
    'cl': 'South America', 'bo': 'South America', 'py': 'South America',
    'uy': 'South America', 'gy': 'South America', 'sr': 'South America', 'gf': 'South America',
    'au': 'Oceania', 'nz': 'Oceania', 'pg': 'Oceania', 'fj': 'Oceania',
    'sb': 'Oceania', 'vu': 'Oceania', 'nc': 'Oceania', 'pf': 'Oceania',
    'tr': 'Middle East', 'ir': 'Middle East', 'iq': 'Middle East',
    'sa': 'Middle East', 'ye': 'Middle East', 'sy': 'Middle East',
    'jo': 'Middle East', 'ae': 'Middle East', 'il': 'Middle East',
    'lb': 'Middle East', 'om': 'Middle East', 'kw': 'Middle East',
    'qa': 'Middle East', 'bh': 'Middle East', 'ps': 'Middle East'
  };

  constructor(
    private worldBankService: WorldBank,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadSvgMap();
    this.loadSelectedCountryFromStorage();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query.toLowerCase();
    this.filterCountriesOnMap();
  }

  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.filterCountriesOnMap();
  }

  filterCountriesOnMap(): void {
    const mapContainer = this.elementRef.nativeElement.querySelector('.map-container');
    if (!mapContainer) return;

    const svgElement = mapContainer.querySelector('svg');
    if (!svgElement) return;

    const allPaths = svgElement.querySelectorAll('path[id]');
    let matchCount = 0;
    
    const regionColors: { [key: string]: string } = {
      'Africa': '#FF6B6B',
      'Asia': '#4ECDC4',
      'Europe': '#45B7D1',
      'North America': '#FFA07A',
      'South America': '#98D8C8',
      'Oceania': '#F7DC6F',
      'Middle East': '#BB8FCE'
    };
    
    if ((!this.searchQuery || this.searchQuery.length === 0) && !this.selectedRegion) {
      allPaths.forEach((path: Element) => {
        const svgPath = path as SVGPathElement;
        if (svgPath !== this.selectedPath) {
          this.renderer.setStyle(svgPath, 'fill', this.DEFAULT_COLOR);
        }
        this.renderer.setStyle(svgPath, 'opacity', '1');
        this.renderer.setStyle(svgPath, 'pointer-events', 'auto');
      });
      return;
    }
    
    allPaths.forEach((path: Element) => {
      const svgPath = path as SVGPathElement;
      const countryCode = svgPath.getAttribute('id');
      
      if (!countryCode) return;
      
      const countryName = this.COUNTRY_NAMES[countryCode.toLowerCase()] || '';
      const countryRegion = this.COUNTRY_REGIONS[countryCode.toLowerCase()] || '';
      
      let matchesSearch = true;
      if (this.searchQuery && this.searchQuery.length > 0) {
        const matchesName = countryName.toLowerCase().includes(this.searchQuery);
        const matchesCode = countryCode.toLowerCase().includes(this.searchQuery);
        matchesSearch = matchesName || matchesCode;
      }
      
      let matchesRegion = true;
      if (this.selectedRegion && this.selectedRegion !== 'All Regions') {
        matchesRegion = countryRegion === this.selectedRegion;
      }
      
      const matches = matchesSearch && matchesRegion;
      
      if (matches) {
        if (svgPath !== this.selectedPath) {
          const color = this.selectedRegion && this.selectedRegion !== 'All Regions' 
            ? regionColors[this.selectedRegion] || '#FFD700'
            : '#FFD700';
          this.renderer.setStyle(svgPath, 'fill', color);
        }
        this.renderer.setStyle(svgPath, 'opacity', '1');
        this.renderer.setStyle(svgPath, 'pointer-events', 'auto');
        matchCount++;
      } else {
        if (svgPath !== this.selectedPath) {
          this.renderer.setStyle(svgPath, 'fill', this.DEFAULT_COLOR);
        }
        this.renderer.setStyle(svgPath, 'opacity', '0.15');
        this.renderer.setStyle(svgPath, 'pointer-events', 'none');
      }
    });
    
    console.log(`Filters: search="${this.searchQuery}", region="${this.selectedRegion}" - ${matchCount} matches`);
  }

  loadSvgMap(): void {
    this.http.get('assets/map-image.svg', { responseType: 'text' })
      .subscribe({
        next: (svgData) => {
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgData);
          setTimeout(() => {
            this.attachEventListeners();
            this.restoreVisualSelection();
          }, 100);
        },
        error: (error) => {
          console.error('Error loading SVG map:', error);
          this.errorMessage = 'Failed to load map. Please refresh the page.';
          this.showError = true;
        }
      });
  }

  attachEventListeners(): void {
    const mapContainer = this.elementRef.nativeElement.querySelector('.map-container');
    if (!mapContainer) return;

    const svgElement = mapContainer.querySelector('svg');
    if (!svgElement) return;

    const countryPaths = svgElement.querySelectorAll('path[id]');
    console.log(`Found ${countryPaths.length} country paths`);

    countryPaths.forEach((path: Element) => {
      const svgPath = path as SVGPathElement;
      this.renderer.listen(svgPath, 'click', (event: Event) => this.onCountryClick(event));
      this.renderer.listen(svgPath, 'mouseenter', (event: Event) => {
        const target = event.target as SVGPathElement;
        if (target !== this.selectedPath) {
          this.renderer.setStyle(target, 'fill', this.HOVER_COLOR);
        }
        this.renderer.setStyle(target, 'cursor', 'pointer');
      });
      this.renderer.listen(svgPath, 'mouseleave', (event: Event) => {
        const target = event.target as SVGPathElement;
        if (target !== this.selectedPath) {
          this.renderer.setStyle(target, 'fill', this.DEFAULT_COLOR);
        }
      });
    });
  }

  onCountryClick(event: Event): void {
    const target = event.target as SVGPathElement;
    const countryCode = target.getAttribute('id');

    if (countryCode) {
      if (this.selectedPath) {
        this.renderer.setStyle(this.selectedPath, 'fill', this.DEFAULT_COLOR);
      }
      this.selectedPath = target;
      this.renderer.setStyle(this.selectedPath, 'fill', this.SELECTED_COLOR);
      localStorage.setItem(this.SELECTED_COUNTRY_CODE_KEY, countryCode);
      this.loadCountryData(countryCode);
    }
  }

  loadCountryData(countryCode: string): void {
    this.isLoading = true;
    this.showError = false;
    this.errorMessage = '';
    this.showChart = false;

    this.worldBankService.getCountryInfo(countryCode).subscribe({
      next: (countryInfo) => {
        this.selectedCountry = countryInfo;
        this.isLoading = false;
        this.saveSelectedCountryToStorage(countryInfo);
        this.loadChartData(countryCode);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load country information. Please try again.';
        this.showError = true;
        this.isLoading = false;
      }
    });
  }

  loadChartData(countryCode: string): void {
    this.worldBankService.getIndicator(countryCode, 'NY.GDP.MKTP.CD', 10).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const validData = data.filter((d: any) => d.value !== null);
          const years = validData.map((d: any) => d.date).reverse();
          const values = validData.map((d: any) => d.value).reverse();
          
          if (years.length > 0) {
            this.chartData = { labels: years, values: values, label: 'GDP (Current US$)' };
            this.showChart = true;
          }
        }
      },
      error: (error) => console.error('Error loading chart data:', error)
    });
  }

  handleErrorRetry(): void {
    this.showError = false;
    const savedCountryCode = localStorage.getItem(this.SELECTED_COUNTRY_CODE_KEY);
    if (savedCountryCode) this.loadCountryData(savedCountryCode);
  }

  private saveSelectedCountryToStorage(country: CountryInfo): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...country, savedAt: new Date().toISOString() }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadSelectedCountryFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const country = JSON.parse(saved);
        const daysDiff = (new Date().getTime() - new Date(country.savedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          this.selectedCountry = country;
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem(this.SELECTED_COUNTRY_CODE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  private restoreVisualSelection(): void {
    try {
      const code = localStorage.getItem(this.SELECTED_COUNTRY_CODE_KEY);
      if (code) {
        const mapContainer = this.elementRef.nativeElement.querySelector('.map-container');
        const svgElement = mapContainer?.querySelector('svg');
        const path = svgElement?.querySelector(`path[id="${code}"]`);
        if (path) {
          this.selectedPath = path as SVGPathElement;
          this.renderer.setStyle(this.selectedPath, 'fill', this.SELECTED_COLOR);
        }
      }
    } catch (error) {
      console.error('Error restoring selection:', error);
    }
  }

  clearSelection(): void {
    if (this.selectedPath) {
      this.renderer.setStyle(this.selectedPath, 'fill', this.DEFAULT_COLOR);
      this.selectedPath = null;
    }
    this.selectedCountry = null;
    this.showChart = false;
    this.chartData = null;
    this.searchQuery = '';
    this.selectedRegion = '';
    this.filterCountriesOnMap();
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SELECTED_COUNTRY_CODE_KEY);
  }
}