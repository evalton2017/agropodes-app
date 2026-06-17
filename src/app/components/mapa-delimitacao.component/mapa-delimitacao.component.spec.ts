import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaDelimitacaoComponent } from './mapa-delimitacao.component';

describe('MapaDelimitacaoComponent', () => {
  let component: MapaDelimitacaoComponent;
  let fixture: ComponentFixture<MapaDelimitacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaDelimitacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaDelimitacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
