import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {RespostaStatusAtividades} from '../../../../model/dashboard-produtor.model';


@Component({
  selector: 'app-dashboard-produtor-status-atividades',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-produtor-status-atividades.component.html',
  styleUrls: ['./dashboard-produtor-status-atividades.component.scss']
})
export class DashboardProdutorStatusAtividadesComponent {

  @Input({ required: true }) dados!: RespostaStatusAtividades;
}
