// dashboard-clima.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {ClimaResumoResponse} from '../../../model/dashboard-produtor.model';
@Component({
  selector: 'app-dashboard-clima',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard-clima.component.html',
  styleUrls: ['./dashboard-clima.component.scss']
})
export class DashboardClimaComponent {
  @Input({ required: true }) dados!: ClimaResumoResponse;

  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    const basePath = 'icons/clima';

    this.iconRegistry.addSvgIcon('vmg-chuva', this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}/thunderstorm.svg`));
    this.iconRegistry.addSvgIcon('vmg-termo', this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}/thermostat.svg`));
    this.iconRegistry.addSvgIcon('vmg-folha', this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}/eco.svg`));
    this.iconRegistry.addSvgIcon('vmg-vento', this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}/air.svg`));

    this.iconRegistry.addSvgIcon('vmg-seta-subir', this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}/arrow_upward.svg`));
    this.iconRegistry.addSvgIcon('vmg-seta-descer', this.sanitizer.bypassSecurityTrustResourceUrl(`${basePath}/arrow_downward.svg`));
  }

  getAbsVal(valor: number): number {
    return Math.abs(valor);
  }
}
