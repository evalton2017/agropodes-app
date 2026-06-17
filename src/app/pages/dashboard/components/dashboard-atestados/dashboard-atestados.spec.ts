import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAtestados } from './dashboard-atestados';

describe('DashboardAtestados', () => {
  let component: DashboardAtestados;
  let fixture: ComponentFixture<DashboardAtestados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAtestados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAtestados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
