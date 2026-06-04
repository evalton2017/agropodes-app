import {ChangeDetectorRef, Component, OnInit, ViewChild, NgZone, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {CarResponse} from '../../dto/response/car';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NgxMaskDirective} from 'ngx-mask';
import {ConsultaCarService} from '../../service/consulta-car.service';
import {SnackbarService} from '../../shared/service/snack-bar.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ElegibilidadeModalComponent} from '../../components/modal/elegibilidade-model/elegibilidade-modal.component';
import {ElegibilidadeResponse} from '../../dto/response/elegibilidade';
import {DetalheCarModal} from '../../model/detalhe-car.modal';


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
    'nomePropriedade',
    'nomeTema',
    'status',
    'numeroArea',
    'poligono'
  ];

  dataSource = new MatTableDataSource<CarResponse>([]);
  elegibilidade = signal<ElegibilidadeResponse | null>(null);

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }


  constructor(
    private readonly fb: FormBuilder,
    private readonly service: ConsultaCarService,
    private readonly snackBar: SnackbarService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      cpf: [''],
      cnpj: [''],
      codigoCar: ['']
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
    this.elegibilidade.set(null);
  }

  avisoCopiado(): void {
    this.snackBar.info('Item copiado para a área de transferência!', 'Fechar')
  }

  cadastrarTerritorio() {
    this.router.navigate(['/cadastro-territorio'], {
      state: {
        propriedade: {
          codigoCar: this.elegibilidade()?.codigoCar,
          nomePropriedade: this.elegibilidade()?.nomePropriedade
        }
      }
    });
  }

  consultarElegibilidade() {
    const dialogRef = this.dialog.open(ElegibilidadeModalComponent, {
      width: '80%',
      disableClose: true,
      data: {propriedades: this.dataSource.data}
    });

    dialogRef.beforeClosed().subscribe(result => {
      if (result) {
        this.elegibilidade.set(result);
      }
    });
  }

  abrirDetalhes() {
    this.dialog.open(DetalheCarModal, {
      width: '850px',
      maxHeight: '90vh',
      data: {numeroCar: this.elegibilidade()?.codigoCar}
    });
  }

  solicitarRelatorio() {
    const codigo = this.elegibilidade()?.codigoCar;

    if (codigo !== undefined && codigo !== null) {
      this.service.detalharCar(String(codigo)).subscribe({
        next: (res) => {
          if (res) {
            this.snackBar.success(
              "Relatorio Solicitado. Aguarde e logo receberá a notificação. ",
              "Fechar"
            );
          }
        },
        error: () => {
          this.snackBar.error("Erro ao solicitar relatorio ", "Fechar");
        }
      });
    }

  }

}
