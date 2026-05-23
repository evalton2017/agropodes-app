import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {Analise, StatusAnaliseLabel, StatusAnaliseType} from '../../../model/analise';
import {MapModalComponent} from '../../../components/modal/map-modal-component';
import {AnaliseService} from '../../../service/analise.service';
import {SnackbarService} from '../../../shared/service/snack-bar.service';

@Component({
  selector: 'app-consulta-analise.component',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './consulta-analise.component.html',
  styleUrl: './consulta-analise.component.scss',
})
export class ConsultaAnaliseComponent implements OnInit {
  private dialog = inject(MatDialog);

  constructor(private readonly analiseService: AnaliseService,
              private readonly snackBar: SnackbarService,) {
    this.consultaAnalise();
  }

  ngOnInit() {

  }

  displayedColumns: string[] = [
    'idAnalise',
    'imagem',
    'coordenadas',
    'poligono',
    'poligonoUnificado',
    'imagemUnificada',
    'status'
  ];

  dataSource = signal<Analise[]>([]);

  consultaAnalise() {
    this.analiseService.consultaAnalise().subscribe({
      next: result => {
        this.dataSource.set(result)
      },
      error: (error) => {
        console.log(error);
        this.snackBar.error(error?.error?.detail);
      }
    })
  }


  verImagem(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  obterDescricaoStatus(status: StatusAnaliseType): string {
    return StatusAnaliseLabel[status] || status;
  }

  // Função utilitária para aplicar a classe CSS correspondente
  obterClasseStatus(status: StatusAnaliseType): string {
    return status.toLowerCase().replace('_', '-');
  }


  abrirModalPoligono(tipo: 'Simples' | 'Unificado', prodes: string) {
    this.dialog.open(MapModalComponent, {
      width: '600px',
      disableClose: false,
      data: {wkt: prodes}
    });
  }


}
