import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RespostaConformidadeAmbientalDTO} from '../../../../model/dashboard-produtor.model';

@Component({
  selector: 'app-dashboard-produtor-tabela',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-produtor-tabela.component.html',
  styleUrls: ['./dashboard-produtor-tabela.component.scss']
})
export class DashboardProdutorTabelaComponent {

  @Input({ required: true }) conformidade!: RespostaConformidadeAmbientalDTO;
}
