import { Component, Input, OnInit, ViewChild, ElementRef, OnChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var Chart: any;

interface ChartData {
  labels: string[];
  values: number[];
  label: string;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" *ngIf="data">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>
      <p class="chart-description">{{ description }}</p>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 20px 0;
    }

    .chart-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1f2937;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      margin-bottom: 12px;
    }

    .chart-description {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin: 0;
    }

    @media (max-width: 768px) {
      .chart-wrapper {
        height: 250px;
      }
    }
  `]
})
export class ChartComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data!: ChartData;
  @Input() type: 'line' | 'bar' = 'line';
  @Input() title: string = 'Data Visualization';
  @Input() description: string = '';

  private chart: any;
  private chartJsLoaded = false;

  ngOnInit() {
    this.loadChartJS();
  }

  ngAfterViewInit() {
    if (this.chartJsLoaded && this.data) {
      setTimeout(() => this.createChart(), 100);
    }
  }

  ngOnChanges() {
    if (this.chart && this.data) {
      this.updateChart();
    }
  }

  private loadChartJS() {
    if (typeof Chart !== 'undefined') {
      this.chartJsLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
      this.chartJsLoaded = true;
      if (this.chartCanvas && this.data) {
        setTimeout(() => this.createChart(), 100);
      }
    };
    document.head.appendChild(script);
  }

  private createChart() {
    if (!this.chartCanvas || !this.data || !this.chartJsLoaded) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.data.labels,
        datasets: [{
          label: this.data.label,
          data: this.data.values,
          backgroundColor: this.type === 'bar' 
            ? 'rgba(99, 102, 241, 0.2)'
            : 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                if (value >= 1000000000) {
                  return (value / 1000000000).toFixed(1) + 'B';
                } else if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(1) + 'K';
                }
                return value;
              }
            }
          }
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart || !this.data) return;

    this.chart.data.labels = this.data.labels;
    this.chart.data.datasets[0].data = this.data.values;
    this.chart.data.datasets[0].label = this.data.label;
    this.chart.update();
  }
}