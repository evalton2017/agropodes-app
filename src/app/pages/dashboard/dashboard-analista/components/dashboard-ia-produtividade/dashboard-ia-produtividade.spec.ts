import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIaProdutividade } from './dashboard-ia-produtividade';

describe('DashboardIaProdutividade', () => {
  let component: DashboardIaProdutividade;
  let fixture: ComponentFixture<DashboardIaProdutividade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardIaProdutividade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardIaProdutividade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
