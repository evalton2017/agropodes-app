// auth-alert.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthAlertService {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private isAlertShown = false; // Evita múltiplos alertas em lote

  public handleSessionExpired() {
    if (this.isAlertShown) return;
    this.isAlertShown = true;

    // Exibe o aviso visual para o usuário
    this.snackBar.open('Sua sessão expirou. Faça login novamente.', 'Entrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    }).onAction().subscribe(() => {
      this.redirectToLogin();
    });

    // Redireciona após o aviso ou imediatamente
    this.redirectToLogin();
  }

  private redirectToLogin() {
    this.router.navigate(['/login']).then(() => {
      this.isAlertShown = false;
    });
  }
}
