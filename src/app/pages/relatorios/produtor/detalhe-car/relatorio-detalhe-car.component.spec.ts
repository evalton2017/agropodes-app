import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioDetalheCarComponent } from './relatorio-detalhe-car.component';

describe('RelatorioDetalheCarComponent', () => {
  let component: RelatorioDetalheCarComponent;
  let fixture: ComponentFixture<RelatorioDetalheCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioDetalheCarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatorioDetalheCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
