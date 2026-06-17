import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIaClassificacao } from './dashboard-ia-classificacao';

describe('DashboardIaClassificacao', () => {
  let component: DashboardIaClassificacao;
  let fixture: ComponentFixture<DashboardIaClassificacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardIaClassificacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardIaClassificacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
