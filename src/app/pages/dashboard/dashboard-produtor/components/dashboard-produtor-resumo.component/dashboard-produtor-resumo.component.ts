import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RespostaDashboardProdutor} from '../../../model/dashboard-produtor.model';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-produtor-resumo',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-produtor-resumo.component.html',
  styleUrls: ['./dashboard-produtor-resumo.component.scss']
})
export class DashboardProdutorResumoComponent {
  @Input({ required: true }) dados!: RespostaDashboardProdutor;
}
