import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-sucesso-multa',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './modal-sucesso-multa.component.html',
  styleUrls: ['./modal-sucesso-multa.component.scss']
})
export class ModalSucessoMultaComponent {
  private dialogRef = inject(MatDialogRef<ModalSucessoMultaComponent>);
  private router = inject(Router);

  fechar(): void {
    this.dialogRef.close();
  }

  irParaFinanceiro(): void {
    this.dialogRef.close();
    this.router.navigate(['/multas-produtor']);
  }
}
