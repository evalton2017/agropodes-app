import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AlertService } from '../../../../components/service/alert.service';
import { PerfisService } from '../../perfis.service';

@Component({
  selector: 'app-perfis-modulo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './perfis-modulos.component.html',
  styleUrls: ['./perfis-modulos.component.scss']
})
export class PerfisModulosComponent implements OnInit {
  private readonly perfilService = inject(PerfisService);
  private readonly alertService = inject(AlertService);

  listaPerfis = signal<any[]>([]);
  listaTodosModulos = signal<any[]>([]);
  drawerAberto = signal<boolean>(false);

  associacaoSelecionada = {
    perfilId: null as number | null,
    moduloIds: [] as number[]
  };

  ngOnInit(): void {
    this.carregarPerfisEModulos();
  }

  carregarPerfisEModulos() {
    this.perfilService.listarPerfisComModulos().subscribe({
      next: (res) => this.listaPerfis.set(res),
      error: () => this.alertService.error('Erro ao carregar perfis.')
    });

    this.perfilService.listarTodosModulos().subscribe({
      next: (res) => this.listaTodosModulos.set(res),
      error: () => this.alertService.error('Erro ao carregar módulos.')
    });
  }

  abrirActionbarAssociacao() {
    this.associacaoSelecionada = { perfilId: null, moduloIds: [] };
    this.drawerAberto.set(true);
  }

  fecharActionbar() {
    this.drawerAberto.set(false);
  }

  toggleModulo(moduloId: number, event: any) {
    if (event.checked) {
      if (!this.associacaoSelecionada.moduloIds.includes(moduloId)) {
        this.associacaoSelecionada.moduloIds.push(moduloId);
      }
    } else {
      this.associacaoSelecionada.moduloIds = this.associacaoSelecionada.moduloIds.filter(id => id !== moduloId);
    }
  }

  isModuloSelecionado(moduloId: number): boolean {
    return this.associacaoSelecionada.moduloIds.includes(moduloId);
  }

  salvarAssociacao() {
    const { perfilId, moduloIds } = this.associacaoSelecionada;

    if (!perfilId || !moduloIds || moduloIds.length === 0) {
      this.alertService.warning('Selecione um perfil e ao menos um módulo.');
      return;
    }

    this.perfilService.associarModuloPerfil(perfilId, moduloIds).subscribe({
      next: () => {
        this.alertService.success('Módulos associados com sucesso!');
        this.fecharActionbar();
        this.carregarPerfisEModulos();
      },
      error: (err) => {
        const msg = err.error?.message || 'Erro ao associar módulos.';
        this.alertService.error(msg);
      }
    });
  }

  onPerfilSelecionado(perfilId: number) {
    const perfilEncontrado = this.listaPerfis().find(p => p.id === perfilId);

    if (perfilEncontrado && perfilEncontrado.modulos) {
      // Extrai os IDs dos módulos já associados a este perfil e joga nos checkboxes
      this.associacaoSelecionada.moduloIds = perfilEncontrado.modulos.map((m: any) => m.id);
    } else {
      this.associacaoSelecionada.moduloIds = [];
    }
  }
}
