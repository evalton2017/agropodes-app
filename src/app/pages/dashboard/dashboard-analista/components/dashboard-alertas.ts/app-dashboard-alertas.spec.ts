import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDashboardAlertasTs } from './app-dashboard-alertas.ts';

describe('AppDashboardAlertasTs', () => {
  let component: AppDashboardAlertasTs;
  let fixture: ComponentFixture<AppDashboardAlertasTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDashboardAlertasTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDashboardAlertasTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
