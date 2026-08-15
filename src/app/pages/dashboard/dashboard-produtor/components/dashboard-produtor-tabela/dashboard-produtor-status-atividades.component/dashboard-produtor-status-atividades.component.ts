import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-produtor-status-atividades',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-produtor-status-atividades.component.html',
  styleUrls: ['./dashboard-produtor-status-atividades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardProdutorStatusAtividadesComponent {
  @Input() dados: any;

  public obterDonutGradient(): string {
    if (!this.dados?.status_glebas?.detalhes || this.dados.status_glebas.total === 0) {
      return 'conic-gradient(#e2e8f0 0deg 360deg)';
    }

    const detalhes = this.dados.status_glebas.detalhes;
    const total = this.dados.status_glebas.total;

    let conforme = 0;
    let atencao = 0;
    let naoConforme = 0;

    detalhes.forEach((d: any) => {
      const st = (d.status || '').toLowerCase();
      if (st.includes('atenção') || st.includes('atencao')) {
        atencao += d.quantidade || 0;
      } else if (st.includes('não') || st.includes('nao')) {
        naoConforme += d.quantidade || 0;
      } else if (st.includes('conforme')) {
        conforme += d.quantidade || 0;
      }
    });

    const p1 = (conforme / total) * 100;
    const p2 = p1 + (atencao / total) * 100;
    const p3 = p2 + (naoConforme / total) * 100;

    // Retorna conic-gradient puro com fallbacks de borda
    return `conic-gradient(#16a34a 0% ${p1}%, #ea580c ${p1}% ${p2}%, #dc2626 ${p2}% ${p3}%, #e2e8f0 ${p3}% 100%)`;
  }
}
