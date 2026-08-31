import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcompanhamentoContestacaoComponent } from './acompanhamento-contestacao.component';

describe('AcompanhamentoContestacaoComponent', () => {
  let component: AcompanhamentoContestacaoComponent;
  let fixture: ComponentFixture<AcompanhamentoContestacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcompanhamentoContestacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcompanhamentoContestacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
