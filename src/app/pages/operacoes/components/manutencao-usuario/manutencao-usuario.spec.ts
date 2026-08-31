import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManutencaoUsuario } from './manutencao-usuario';

describe('ManutencaoUsuario', () => {
  let component: ManutencaoUsuario;
  let fixture: ComponentFixture<ManutencaoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManutencaoUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManutencaoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
