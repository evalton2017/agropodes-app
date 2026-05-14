import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {TerritorioResponse} from '../../../model/territorio';
import {TerritorioService} from '../../../service/territorio.service';
import {MatDialog} from '@angular/material/dialog';
import {ProdesResponse} from '../../../dto/response/prodes-response';
import {MapModalComponent} from '../../../components/modal/map-modal-component';
import {SnackbarService} from '../../../shared/service/snack-bar.service';
import {
  MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';


@Component({
  selector: 'app-cadastra-territorio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionModule,
    MatExpansionPanelDescription,
    CdkCopyToClipboard
  ],
  templateUrl: './cadastra-territorio.ts.html',
  styleUrl: './cadastra-territorio.ts.scss',
})
export class CadastraTerritorioComponent {
  cadastroForm: FormGroup;

  territorioResultado = signal<TerritorioResponse | null>(null);

  constructor(private readonly fb: FormBuilder,
              private readonly service: TerritorioService,
              private readonly dialog: MatDialog,
              private readonly snackBar: SnackbarService) {
    this.cadastroForm = this.fb.group({
      nomeTerritorio: ['', Validators.required],
      codigoCar: ['', Validators.required]
    });

  }

  onSubmit(): void {
    if (this.cadastroForm.invalid) {
      return;
    }

    this.service.cadastrarTerritorio( this.cadastroForm.value)
      .subscribe({
        next: (res) => {
          this.territorioResultado.set(res);
        },
        error: (err) => {
          this.snackBar.error(err.error.detail);
        }
      });

    this.cadastroForm.reset();
  }

  visualizarPoligono(territorioResponse: TerritorioResponse){
    this.dialog.open(MapModalComponent, {
      width: '600px',
      disableClose: false,
      data: { wkt: territorioResponse.poligono }
    });
  }

  avisoCopiado(): void {
    this.snackBar.info('Item copiado para a área de transferência!', 'Fechar')
  }
}
