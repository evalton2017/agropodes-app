import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GlebaService} from '../../service/gleba.service';
import {SafrasGlebaAPIResponse} from '../../pages/model/gleba.model';

export interface SafraItem {
  id_safra: string;
  label: string;
  status: string;
  vigente: boolean;
}

@Component({
  selector: 'app-seletor-safras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seletor-safras.component.html',
  styleUrls: ['./seletor-safras.component.scss']
})
export class SeletorSafrasComponent implements OnChanges {
  @Input({ required: true }) idGleba!: number;
  @Output() safraSelecionada = new EventEmitter<SafraItem>();

  private readonly glebaService = inject(GlebaService);

  public safrasMapeadas: SafraItem[] = [];
  public safraAtiva: SafraItem | null = null;
  public carregando = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idGleba'] && this.idGleba) {
      this.carregarSafrasGleba(this.idGleba);
    }
  }

  private carregarSafrasGleba(idGleba: number): void {
    this.carregando = true;

    this.glebaService.buscarSafra(idGleba).subscribe({
      next: (res: SafrasGlebaAPIResponse) => {
        if (res && res.safras && res.safras.length > 0) {
          this.safrasMapeadas = res.safras.map((s) => {
            const isVigente = s === res.safra_principal;
            return {
              id_safra: s,
              label: s,
              status: isVigente ? 'Vigente' : 'Concluída',
              vigente: isVigente
            };
          });

          // Define a safra principal como selecionada por padrão
          const principal = this.safrasMapeadas.find(s => s.vigente) || this.safrasMapeadas[0];
          this.selecionarSafra(principal);
        } else {
          this.safrasMapeadas = [];
          this.safraAtiva = null;
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error(`Erro ao carregar safras da gleba ${idGleba}:`, err);
        this.safrasMapeadas = [];
        this.safraAtiva = null;
        this.carregando = false;
      }
    });
  }

  public selecionarSafra(safra: SafraItem): void {
    this.safraAtiva = safra;
    this.safraSelecionada.emit(safra);
  }
}
