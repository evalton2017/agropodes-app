import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {CarResponse} from '../../dto/response/car';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {NgxMaskDirective} from 'ngx-mask';
import {ConsultaCarService} from '../../service/consulta-car.service';
import {SnackbarService} from '../../shared/service/snack-bar.service';



@Component({
  selector: 'app-consulta-car',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    ClipboardModule,
    MatIconModule,
    NgxMaskDirective,
    MatSnackBarModule
  ],
  templateUrl: './consulta-car.component.html',
  styleUrls: ['./consulta-car.component.scss']
})
export class ConsultaCarComponent implements OnInit {
  filterForm!: FormGroup;
  readonly carMask = 'SS-0000000-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  displayedColumns: string[] = [
    'id',
    'codigoCar',
    'nomeTema',
    'status',
    'numeroArea',
    'poligono'
  ];

  dataSource = new MatTableDataSource<CarResponse>([]);

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }


  constructor(
    private readonly fb: FormBuilder,
    private readonly service: ConsultaCarService,
    private readonly snackBar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      cpf: [''],
      cnpj: [''],
      carFederal: ['']
    });
  }

  pesquisar(): void {
    const filtros = this.filterForm.value;

    this.service.consultaCar(filtros).subscribe({
      next: (res) => {
        this.dataSource.data = res;
      },
      error: (error) => {
        console.log(error);
        this.snackBar.error(error.error.detail);
      }
    })
  }

  limpar(): void {
    this.filterForm.reset();
    this.dataSource.data = [];
  }

  avisoCopiado(): void {
    this.snackBar.info('Item copiado para a área de transferência!', 'Fechar')
  }
}
