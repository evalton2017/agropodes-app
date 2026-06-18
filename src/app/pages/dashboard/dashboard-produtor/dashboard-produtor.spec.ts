import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutor } from './dashboard-produtor';

describe('DashboardProdutor', () => {
  let component: DashboardProdutor;
  let fixture: ComponentFixture<DashboardProdutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
