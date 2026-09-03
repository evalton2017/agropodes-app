import { Component, OnInit, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {PropriedadeService} from '../../propriedade.service';
import {DetalhesPropriedadeResponse} from '../../propriedade.model';

@Component({
  selector: 'app-detalhes-propriedade',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './detalhes-propriedade.component.html',
  styleUrl: './detalhes-propriedade.component.scss'
})
export class DetalhesPropriedadeComponent implements OnInit {
  idPropriedade = input.required<number>();
  voltarClick = output<void>();

  loading = signal<boolean>(true);
  detalhes = signal<DetalhesPropriedadeResponse | null>(null);

  // 🟢 Injeção do PropriedadeService em vez do HttpClient
  private propriedadeService = inject(PropriedadeService);

  ngOnInit(): void {
    this.carregarDetalhes();
  }

  carregarDetalhes(): void {
    this.loading.set(true);

    // 🟢 Chamada delegada ao Service
    this.propriedadeService.obterDetalhesPropriedade(this.idPropriedade())
      .subscribe({
        next: (res) => {
          this.detalhes.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar detalhes da propriedade:', err);
          this.loading.set(false);
        }
      });
  }
}
