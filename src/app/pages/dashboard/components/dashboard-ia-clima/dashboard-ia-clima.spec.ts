import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIaClima } from './dashboard-ia-clima';

describe('DashboardIaClima', () => {
  let component: DashboardIaClima;
  let fixture: ComponentFixture<DashboardIaClima>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardIaClima]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardIaClima);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
