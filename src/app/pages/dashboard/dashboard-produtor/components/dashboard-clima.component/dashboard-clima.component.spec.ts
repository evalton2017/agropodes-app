import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardClimaComponent } from './dashboard-clima.component';

describe('DashboardClimaComponent', () => {
  let component: DashboardClimaComponent;
  let fixture: ComponentFixture<DashboardClimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardClimaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardClimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
