import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="error-container">
      <div class="error-content">
        <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div class="error-text">
          <h4 class="error-title">{{ title }}</h4>
          <p class="error-message">{{ message }}</p>
        </div>
        <button (click)="onClose()" class="close-btn">×</button>
      </div>
      <button *ngIf="showRetry" (click)="onRetry()" class="retry-btn">
        Try Again
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .error-icon {
      width: 24px;
      height: 24px;
      color: #ef4444;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
    }

    .error-title {
      font-size: 16px;
      font-weight: 600;
      color: #991b1b;
      margin: 0 0 4px 0;
    }

    .error-message {
      font-size: 14px;
      color: #7f1d1d;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #991b1b;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(153, 27, 27, 0.1);
    }

    .retry-btn {
      margin-top: 12px;
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      width: 100%;
    }

    .retry-btn:hover {
      background: #dc2626;
    }
  `]
})
export class ErrorComponent {
  @Input() show: boolean = false;
  @Input() title: string = 'Error';
  @Input() message: string = 'Something went wrong. Please try again.';
  @Input() showRetry: boolean = true;
  @Output() close = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  onClose() {
    this.show = false;
    this.close.emit();
  }

  onRetry() {
    this.retry.emit();
  }
}