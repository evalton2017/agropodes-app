import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-imagem',
    standalone: true,
    imports: [],
    template: `
    <div style="position: relative; display: flex; justify-content: center; align-items: center; overflow: hidden;">
      <img [src]="data.imageUrl" alt="Imagem Ampliada" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 4px;" />
    </div>
  `,
  })
  export class ModalImagensComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }) {}
}
