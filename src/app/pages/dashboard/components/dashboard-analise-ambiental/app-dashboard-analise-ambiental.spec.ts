import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDashboardAnaliseAmbiental } from './app-dashboard-analise-ambiental';

describe('AppDashboardAnaliseAmbiental', () => {
  let component: AppDashboardAnaliseAmbiental;
  let fixture: ComponentFixture<AppDashboardAnaliseAmbiental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDashboardAnaliseAmbiental]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDashboardAnaliseAmbiental);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
