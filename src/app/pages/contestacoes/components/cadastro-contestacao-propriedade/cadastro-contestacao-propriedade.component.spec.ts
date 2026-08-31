import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroContestacaoPropriedadeComponent } from './cadastro-contestacao-propriedade.component';

describe('CadastroContestacaoPropriedadeComponent', () => {
  let component: CadastroContestacaoPropriedadeComponent;
  let fixture: ComponentFixture<CadastroContestacaoPropriedadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroContestacaoPropriedadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroContestacaoPropriedadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
