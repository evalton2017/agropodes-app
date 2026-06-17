import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAnalistaComponent } from './dashboard-analista.component';

describe('DashboardAnalistaComponent', () => {
  let component: DashboardAnalistaComponent;
  let fixture: ComponentFixture<DashboardAnalistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAnalistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAnalistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
