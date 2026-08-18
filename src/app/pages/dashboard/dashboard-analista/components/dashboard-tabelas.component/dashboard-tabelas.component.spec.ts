import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabelasComponent } from './dashboard-tabelas.component';

describe('DashboardTabelasComponent', () => {
  let component: DashboardTabelasComponent;
  let fixture: ComponentFixture<DashboardTabelasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTabelasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTabelasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
