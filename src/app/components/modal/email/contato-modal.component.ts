import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {EmailService} from '../../service/email.service';
import {SnackbarService} from '../../../shared/service/snack-bar.service';

@Component({
  selector: 'app-contato-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './contato-modal.component.html',
  styleUrls: ['./contato-modal.component.scss']
})
export class ContatoModalComponent {
  private fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ContatoModalComponent>);
  private readonly emailService = inject(EmailService);
  private readonly snackBar = inject(SnackbarService);

  formContato: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nome: ['', Validators.required],
    telefone: ['', Validators.required],
    mensagem: ['', Validators.required]
  });

  enviar() {
    if (this.formContato.valid) {
      this.emailService.enviarEmail(this.formContato.value).subscribe({
        next: (res) => {
          this.snackBar.success('Email enviado com sucesso!!', 'Fechar')
          this.dialogRef.close();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.error('Erro ao enviar email', 'Fechar')
        }
      });
    }
  }

  fechar() {
    this.dialogRef.close();
  }
}
