import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManutencaoEmpresa } from './manutencao-empresa';

describe('ManutencaoEmpresa', () => {
  let component: ManutencaoEmpresa;
  let fixture: ComponentFixture<ManutencaoEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManutencaoEmpresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManutencaoEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
