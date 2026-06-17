import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaLocalizacaoComponent } from './mapa-localizacao.component';

describe('MapaLocalizacaoComponent', () => {
  let component: MapaLocalizacaoComponent;
  let fixture: ComponentFixture<MapaLocalizacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaLocalizacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaLocalizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
