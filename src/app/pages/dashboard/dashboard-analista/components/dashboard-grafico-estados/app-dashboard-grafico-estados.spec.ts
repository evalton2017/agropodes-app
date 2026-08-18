import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDashboardGraficoEstados } from './app-dashboard-grafico-estados';

describe('AppDashboardGraficoEstados', () => {
  let component: AppDashboardGraficoEstados;
  let fixture: ComponentFixture<AppDashboardGraficoEstados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDashboardGraficoEstados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDashboardGraficoEstados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
