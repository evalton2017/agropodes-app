import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutividade } from './dashboard-produtividade';

describe('DashboardProdutividade', () => {
  let component: DashboardProdutividade;
  let fixture: ComponentFixture<DashboardProdutividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutividade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutividade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
