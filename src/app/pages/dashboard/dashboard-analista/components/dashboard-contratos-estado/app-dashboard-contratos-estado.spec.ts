import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDashboardContratosEstado } from './app-dashboard-contratos-estado';

describe('AppDashboardContratosEstado', () => {
  let component: AppDashboardContratosEstado;
  let fixture: ComponentFixture<AppDashboardContratosEstado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDashboardContratosEstado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDashboardContratosEstado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
