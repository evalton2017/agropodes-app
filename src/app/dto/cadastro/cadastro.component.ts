import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {UsuarioService} from '../../service/usuario.service';
import {SnackbarService} from '../../shared/service/snack-bar.service';

@Component({
  selector: 'app-cadastro-gleba',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;
  esconderSenha = true;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private readonly snackBar: SnackbarService,
    private readonly  service: UsuarioService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.cadastroForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.cadastroForm.valid) {
      // Objeto pronto com a estrutura exata exigida
      const payloadCadastro = this.cadastroForm.value;
      this.service.cadastrar(payloadCadastro).subscribe({
        next: (response) => {
          this.snackBar.success(response)
          this.router.navigate(['/consulta-car']);
        },
        error: (err) => {
          console.log('error', err);
          this.snackBar.error(err.error.detail);
        }
      })
    }
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }
}
