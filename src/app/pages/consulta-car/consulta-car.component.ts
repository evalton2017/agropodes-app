import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { ConsultaCarService } from '../../service/consulta-car.service';
import { SnackbarService } from '../../shared/service/snack-bar.service';
import { ImovelAmbiental } from '../../dto/response/car';

@Component({
  selector: 'app-consulta-car',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective
  ],
  templateUrl: './consulta-car.component.html',
  styleUrls: ['./consulta-car.component.scss']
})
export class ConsultaCarComponent implements OnInit {
  filterForm!: FormGroup;
  readonly carMask = 'AA-0000000-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  // Substituído o MatTableDataSource por um array nativo simples
  dadosCar: ImovelAmbiental[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: ConsultaCarService,
    private readonly snackBar: SnackbarService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      codigoCar: ['']
    });
  }

  pesquisar(): void {
    const filtros = this.filterForm.value;
    this.dadosCar = [];

    this.service.consultaCarNacional(filtros.codigoCar).subscribe({
      next: (res) => {
        this.dadosCar = [...this.dadosCar, res];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.snackBar.error(error.error?.detail || 'Erro ao buscar dados.');
      }
    });
  }

  limpar(): void {
    this.filterForm.reset();
    this.dadosCar = [];
  }

  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(() => {
      this.snackBar.info('Item copiado para a área de transferência!', 'Fechar');
    });
  }
}
