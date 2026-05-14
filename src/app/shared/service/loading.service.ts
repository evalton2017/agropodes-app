import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal privado para controlar o estado
  private loadingSignal = signal<boolean>(false);

  // Exposição pública do sinal apenas para leitura
  readonly isLoading = this.loadingSignal.asReadonly();

  show(): void {
    this.loadingSignal.set(true);
  }

  hide(): void {
    this.loadingSignal.set(false);
  }
}
