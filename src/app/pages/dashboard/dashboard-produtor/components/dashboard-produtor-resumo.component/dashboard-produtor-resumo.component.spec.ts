import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutorResumoComponent } from './dashboard-produtor-resumo.component';

describe('DashboardProdutorResumoComponent', () => {
  let component: DashboardProdutorResumoComponent;
  let fixture: ComponentFixture<DashboardProdutorResumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutorResumoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutorResumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
