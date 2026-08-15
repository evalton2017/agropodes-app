import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

@Component({
  selector: 'app-evidencias-faq',
  standalone: true,
  imports: [MatIconModule, MatAccordion, MatExpansionPanelHeader, MatExpansionPanel, MatExpansionPanelTitle,],
  templateUrl: './evidencias-faq.component.html',
  styleUrl: './evidencias-faq.component.scss',
})
export class EvidenciasFaqComponent {

}
