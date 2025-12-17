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
        // World Bank API returns an array where the second element contains the country data
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
        // Return default values if no data found
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
}
