// alert.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.openSnackBar(message, 'sucesso');
  }

  error(message: string) {
    this.openSnackBar(message, 'erro');
  }

  warning(message: string) {
    this.openSnackBar(message, 'alerta');
  }

  private openSnackBar(message: string, type: 'sucesso' | 'erro' | 'alerta') {
    let panelClass = 'snackbar-sucesso';
    if (type === 'erro') panelClass = 'snackbar-erro';
    if (type === 'alerta') panelClass = 'snackbar-alerta';

    this.snackBar.open(message, 'X', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }
}
