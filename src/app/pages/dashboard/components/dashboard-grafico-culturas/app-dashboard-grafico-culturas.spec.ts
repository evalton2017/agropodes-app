import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDashboardGraficoCulturas } from './app-dashboard-grafico-culturas';

describe('AppDashboardGraficoCulturas', () => {
  let component: AppDashboardGraficoCulturas;
  let fixture: ComponentFixture<AppDashboardGraficoCulturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDashboardGraficoCulturas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDashboardGraficoCulturas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
