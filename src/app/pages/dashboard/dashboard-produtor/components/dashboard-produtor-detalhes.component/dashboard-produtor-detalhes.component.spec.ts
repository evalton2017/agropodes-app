import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutorDetalhesComponent } from './dashboard-produtor-detalhes.component';

describe('DashboardProdutorDetalhesComponent', () => {
  let component: DashboardProdutorDetalhesComponent;
  let fixture: ComponentFixture<DashboardProdutorDetalhesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutorDetalhesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutorDetalhesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
