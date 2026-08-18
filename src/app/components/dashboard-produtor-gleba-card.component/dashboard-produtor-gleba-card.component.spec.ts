import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutorGlebaCardComponent } from './dashboard-produtor-gleba-card.component';

describe('DashboardProdutorGlebaCardComponent', () => {
  let component: DashboardProdutorGlebaCardComponent;
  let fixture: ComponentFixture<DashboardProdutorGlebaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutorGlebaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutorGlebaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
