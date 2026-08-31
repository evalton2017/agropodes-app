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
    const snackBarRef = this.snackBar.open('Sua sessão expirou. Faça login novamente.', 'Entrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    // Redireciona se o usuário clicar no botão "Entrar"
    snackBarRef.onAction().subscribe(() => {
      this.redirectToLogin();
    });

    // Redireciona também quando o snackbar fechar automaticamente (após os 5 segundos)
    snackBarRef.afterDismissed().subscribe(() => {
      this.redirectToLogin();
    });
  }

  private redirectToLogin() {
    // Garante que o redirecionamento ocorra apenas uma vez por ciclo de alerta
    if (!this.isAlertShown) return;

    this.router.navigate(['/login']).then(() => {
      this.isAlertShown = false;
    });
  }
}
