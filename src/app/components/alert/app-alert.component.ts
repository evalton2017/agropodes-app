import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (mensagem()) {
      <div class="custom-alert" [ngClass]="tipo()">
        <mat-icon>{{ icone }}</mat-icon>
        <span>{{ mensagem() }}</span>
        <button class="close-btn" (click)="fechar.emit()">×</button>
      </div>
    }
  `,
  styles: [`
    .custom-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      color: #fff;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .success { background-color: #2e7d32; border-left: 5px solid #4caf50; }
    .error { background-color: #c62828; border-left: 5px solid #f44336; }
    .warning { background-color: #ef6c00; border-left: 5px solid #ff9800; }
    .close-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; margin-left: auto; }
  `]
})
export class AppAlertComponent {
  mensagem = input<string>('');
  tipo = input<'success' | 'error' | 'warning'>('success');
  fechar = output<void>();

  get icone(): string {
    switch (this.tipo()) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}
