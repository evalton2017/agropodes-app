import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {CarResponse} from '../../../dto/response/car';
import {ConsultaCarService} from '../../../service/consulta-car.service';
import {SnackbarService} from '../../../shared/service/snack-bar.service';

@Component({
  selector: 'app-consulta-modal',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    ReactiveFormsModule
  ],
  templateUrl: './elegibilidade-modal.component.html',
  styleUrls: ['./elegibilidade-modal.component.scss']
})
export class ElegibilidadeModalComponent {

  propriedadeSelecionada: any = null;
  propriedades: CarResponse[] = []
  carregando = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { propriedades: CarResponse[] },
    private readonly dialogRef: MatDialogRef<ElegibilidadeModalComponent>,
    private readonly snackBar: SnackbarService,
    private readonly service: ConsultaCarService) {
    this.propriedades  = data.propriedades;
  }


  consultar() {
    this.carregando = true;
    const request = {codigoCar: this.propriedadeSelecionada.codigoCar, poligono: this.propriedadeSelecionada.poligono};
    this.service.consultaElegibilidade(request).subscribe({
      next: (response: any) => {
        response.nomePropriedade = this.propriedadeSelecionada.nomePropriedade;
        this.dialogRef.close(response);
      }, error: (error) => {
        this.snackBar.error(error.error.detail);
        this.carregando = false;
        this.propriedadeSelecionada = null;
      }
    })
  }

  fechar() {
    this.dialogRef.close();
  }

  selecionar(propriedade: CarResponse ){
    this.propriedadeSelecionada = propriedade;
  }
}
