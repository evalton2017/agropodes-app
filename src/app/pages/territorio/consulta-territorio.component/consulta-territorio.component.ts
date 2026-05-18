import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {TerritorioService} from '../../../service/territorio.service';
import {SnackbarService} from '../../../shared/service/snack-bar.service';
import {TerritorioResponse} from '../../../model/territorio';
import {MapModalComponent} from '../../../components/modal/map-modal-component';
import {MatDialog} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ModalImagensComponent} from '../../../components/modal/modal-imagens.component';

export interface ImagemTerritorio {
  chave: string;
  dataCadastro: string;
  imageUrl: string;
}

export interface Territorio {
  dataAtualizacao: string | null;
  dataCadastro: string;
  hashTransacao: string;
  imagens: ImagemTerritorio[];
  nomePropriedade: string;
  numeroCar: string;
  poligono: string;
}

@Component({
  selector: 'app-consulta-territorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,  MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule],
  templateUrl: './consulta-territorio.component.html',
  styleUrls: ['./consulta-territorio.component.scss']
})
export class ConsultaTerritorioComponent implements OnInit {
  searchForm!: FormGroup;
  resultados: ImagemTerritorio[] = [];
  territorioResponse: any;
  loading = false;
  submitted = false;


  constructor(private readonly fb: FormBuilder,
              private readonly service: TerritorioService,
              private readonly dialog: MatDialog,
              private readonly cdr: ChangeDetectorRef,
              private readonly snackBar: SnackbarService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      hash: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) return;

    this.submitted = true;
    this.loading = true;
    this.resultados = [];

    const hashBuscado = this.searchForm.value.hash.trim();

    this.service.consultaTerritorio(hashBuscado).subscribe({
      next: (res) => {
        this.territorioResponse = res;
        this.resultados = res.imagens;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        this.snackBar.error(error?.error ? error?.error?.detail : "Erro na requisição");
        this.cdr.detectChanges();
      }
    })
  }


  visualizarPoligono(territorioResponse: TerritorioResponse){
    this.dialog.open(MapModalComponent, {
      width: '600px',
      disableClose: false,
      data: { wkt: territorioResponse.poligono }
    });
  }

  abrirModalImagem(url: string): void {
    this.dialog.open(ModalImagensComponent, {
      data: { imageUrl: url },
      panelClass: 'custom-image-dialog', // Classe para remover bordas/paddings se desejar
      maxHeight: '90vh',
      maxWidth: '90vw'
    });
  }


}
