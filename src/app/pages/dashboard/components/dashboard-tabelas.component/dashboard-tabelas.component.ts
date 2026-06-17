import {Component, input, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EventoClimatico, UltimoAtestado } from '../../model/dashboard.model';

@Component({
  selector: 'app-dashboard-tabelas',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-tabelas.component.html',
  styleUrls: ['./dashboard-tabelas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardTabelasComponent {
  eventosClimaticos = input.required<EventoClimatico[]>();
  ultimosAtestados = input.required<UltimoAtestado[]>();

}
