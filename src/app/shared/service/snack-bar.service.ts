import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  };

  /** Exibe notificação de sucesso */
  success(message: string, action: string = 'OK'): void {
    this.open(message, action, 'snack-success');
  }

  /** Exibe notificação de erro ou falha */
  error(message: string, action: string = 'Fechar'): void {
    this.open(message, action, 'snack-error');
  }

  /** Exibe notificação de aviso ou informação */
  info(message: string, action: string = 'OK'): void {
    this.open(message, action, 'snack-info');
  }

  private open(message: string, action: string, panelClass: string): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: [panelClass],
      duration: 5000
    });
  }
}
