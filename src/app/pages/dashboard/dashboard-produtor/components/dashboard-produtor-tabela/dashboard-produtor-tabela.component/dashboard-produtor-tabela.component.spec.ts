import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutorTabelaComponent } from './dashboard-produtor-tabela.component';

describe('DashboardProdutorTabelaComponent', () => {
  let component: DashboardProdutorTabelaComponent;
  let fixture: ComponentFixture<DashboardProdutorTabelaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutorTabelaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutorTabelaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
