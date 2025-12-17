import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CountryInfo {
  name: string;
  capital: string;
  region: string;
  incomeLevel: string;
  longitude: string;
  latitude: string;
  savedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorldBank {
  private apiBaseUrl = 'https://api.worldbank.org/v2/country';

  constructor(private http: HttpClient) { }

  /**
   * Fetches country information from World Bank API using a two-letter country code
   * @param countryCode Two-letter ISO country code (e.g., 'us', 'gb', 'fr')
   * @returns Observable containing country information
   */
  getCountryInfo(countryCode: string): Observable<CountryInfo> {
    const url = `${this.apiBaseUrl}/${countryCode}?format=json`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.length > 1 && response[1].length > 0) {
          const country = response[1][0];
          return {
            name: country.name || 'N/A',
            capital: country.capitalCity || 'N/A',
            region: country.region?.value || 'N/A',
            incomeLevel: country.incomeLevel?.value || 'N/A',
            longitude: country.longitude || 'N/A',
            latitude: country.latitude || 'N/A'
          };
        }
        return {
          name: 'Unknown',
          capital: 'N/A',
          region: 'N/A',
          incomeLevel: 'N/A',
          longitude: 'N/A',
          latitude: 'N/A'
        };
      })
    );
  }

  /**
   * Fetches indicator data (like GDP, population) for a specific country
   * @param countryCode Two-letter ISO country code
   * @param indicator World Bank indicator code (e.g., 'NY.GDP.MKTP.CD' for GDP)
   * @param years Number of years of historical data to fetch
   * @returns Observable containing indicator data
   */
  getIndicator(countryCode: string, indicator: string, years: number = 10): Observable<any[]> {
    const startYear = new Date().getFullYear() - years;
    const endYear = new Date().getFullYear();
    const url = `${this.apiBaseUrl}/${countryCode}/indicator/${indicator}?date=${startYear}:${endYear}&format=json&per_page=100`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        // World Bank API returns data in second element of array
        if (response && response.length > 1) {
          return response[1] || [];
        }
        return [];
      })
    );
  }

  /**
   * Fetches all countries for search functionality
   * @returns Observable containing array of all countries
   */
  getAllCountries(): Observable<any[]> {
    const url = `${this.apiBaseUrl}?format=json&per_page=300`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.length > 1) {
          return response[1] || [];
        }
        return [];
      })
    );
  }

  /**
   * Common World Bank Indicators:
   * - NY.GDP.MKTP.CD: GDP (current US$)
   * - SP.POP.TOTL: Population, total
   * - SP.URB.TOTL.IN.ZS: Urban population (% of total)
   * - NY.GDP.PCAP.CD: GDP per capita (current US$)
   * - SL.UEM.TOTL.ZS: Unemployment rate
   */
}