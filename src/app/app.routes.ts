import { Routes } from '@angular/router';
import { Map } from './map/map';

export const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: Map }
];
