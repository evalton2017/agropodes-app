import {Component, inject, signal} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AnaliseService} from '../../../service/descontinuados/analise.service';
import {SnackbarService} from '../../../shared/service/snack-bar.service';
import {Analise, StatusAnaliseLabel, StatusAnaliseType} from '../../../model/analise';
import {MapModalComponent} from '../../../components/modal/map-modal-component';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule, NgClass} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';


@Component({
  selector: 'app-consulta-analise-produtor.component',
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './consulta-analise-produtor.component.html',
  styleUrl: './consulta-analise-produtor.component.scss',
})
export class ConsultaAnaliseProdutorComponent {
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
