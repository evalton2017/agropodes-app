import { Component } from '@angular/core';
import {MatIcon, MatIconModule} from '@angular/material/icon';

interface RankingItem {
  label: string;
  value: string;
  percent: number;
  colorClass: string; // lima, safra, ambar, satelite, etc.
}

interface TabData {
  id: string;
  title: string;
  badge: string;
  detailTitle: string;
  detailText: string;
  items: RankingItem[];
  footnote: string;
}

@Component({
  selector: 'app-saida-plataforma',
  templateUrl: './saida-plataforma.component.html',
  imports: [
    MatIconModule
  ],
  styleUrls: ['./saida-plataforma.component.scss']
})
export class SaidaPlataformaComponent {

  abaAtivaId = 'classificacao';

  dadosAbas: Record<string, TabData> = {
    classificacao: {
      id: 'classificacao',
      title: 'Classificação de culturas',
      badge: 'CLASSIFICAÇÃO POR IA',
      detailTitle: 'Qual cultura foi efetivamente plantada',
      detailText: 'A cultura declarada é confrontada com a cultura observada na série multiespectral do talhão. A verificação alcança a safra vigente e as cinco safras-glebas anteriores, sem vistoria presencial.',
      footnote: 'Talhões classificados por cultura - exemplo de saída do módulo. Valores exibidos como exemplo de estrutura de saída, não referentes a uma área real.',
      items: [
        { label: 'Soja', value: '31.668', percent: 90, colorClass: 'bar-lima' },
        { label: 'Milho', value: '24.882', percent: 75, colorClass: 'bar-ambar' },
        { label: 'Café', value: '18.096', percent: 55, colorClass: 'bar-safra' },
        { label: 'Trigo', value: '9.048', percent: 35, colorClass: 'bar-satelite' },
        { label: 'Arroz', value: '4.524', percent: 20, colorClass: 'bar-lima' },
        { label: 'Feijão', value: '2.262', percent: 12, colorClass: 'bar-ambar' }
      ]
    },
    produtividade: {
      id: 'produtividade',
      title: 'Estimativa de produtividade',
      badge: 'PRODUTIVIDADE POR TALHÃO',
      detailTitle: 'Produtividade do talhão em sacas por hectare',
      detailText: 'A quantificação é individualizada por talhão, não por média regional, e serve para conferir se o volume que o produtor deseja comercializar é compatível com o que a área efetivamente produziu.',
      footnote: 'Faixa das cinco safras-glebas anteriores contra o ciclo vigente. Valores exibidos como exemplo de estrutura de saída, não referentes a uma área real.',
      items: [
        { label: 'Soja · safra vigente', value: '62,4 sc/ha', percent: 88, colorClass: 'bar-lima' },
        { label: 'Soja · média 5 safras-glebas', value: '58,1 sc/ha', percent: 80, colorClass: 'bar-safra' },
        { label: 'Milho · safra vigente', value: '118,7 sc/ha', percent: 72, colorClass: 'bar-ambar' },
        { label: 'Milho · média 5 safras-glebas', value: '111,2 sc/ha', percent: 66, colorClass: 'bar-safra' }
      ]
    },
    clima: {
      id: 'clima',
      title: 'Inteligência climática',
      badge: 'PARÂMETROS CLIMÁTICOS',
      detailTitle: 'Clima observado sobre a própria gleba',
      detailText: 'Estações do INMET são trianguladas por IDW, RBF ou Spline, sempre com no mínimo três estações operantes. Em caso de pane, a base mais próxima substitui automaticamente a estação problemática.',
      footnote: 'Séries diárias, mensais e anuais dos últimos sessenta meses. Valores exibidos como exemplo de estrutura de saída, não referentes a uma área real.',
      items: [
        { label: 'Chuva acumulada desde o plantio', value: '670,8 mm', percent: 82, colorClass: 'bar-satelite' },
        { label: 'Temperatura média do ciclo', value: '24,6 °C', percent: 60, colorClass: 'bar-ambar' },
        { label: 'Dias sem chuva no período crítico', value: '17 dias', percent: 38, colorClass: 'bar-vermelho' },
        { label: 'Velocidade média dos ventos', value: '9,2 km/h', percent: 28, colorClass: 'bar-safra' }
      ]
    },
    solo: {
      id: 'solo',
      title: 'Propriedades do solo',
      badge: 'MAPA TRIDIMENSIONAL',
      detailTitle: 'Matéria orgânica, nitrogênio e saúde das plantas',
      detailText: 'Cada ponto dentro da geometria recebe um valor em escala cromática HEX, preenchendo o grid do mapa interativo tridimensional em CRS EPSG:4326.',
      footnote: 'Grid hexagonal preenchido com valores HEX por latitude e longitude. Valores exibidos como exemplo de estrutura de saída, não referentes a uma área real.',
      items: [
        { label: 'Matéria orgânica · nível adequado', value: '68% da área', percent: 68, colorClass: 'bar-safra' },
        { label: 'Nitrogênio · nível adequado', value: '54% da área', percent: 54, colorClass: 'bar-lima' },
        { label: 'Saúde das plantas · vigor alto', value: '71% da área', percent: 71, colorClass: 'bar-satelite' },
        { label: 'Zonas com deficiência identificada', value: '23% da área', percent: 23, colorClass: 'bar-ambar' }
      ]
    }
  };

  get abaAtual(): TabData {
    return this.dadosAbas[this.abaAtivaId];
  }

  selecionarAba(id: string) {
    this.abaAtivaId = id;
  }

  verModuloVerificacao() {}
}
