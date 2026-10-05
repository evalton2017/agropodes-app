import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestacaoRelatorioComponent } from './contestacao.relatorio.component';

describe('ContestacaoRelatorioComponent', () => {
  let component: ContestacaoRelatorioComponent;
  let fixture: ComponentFixture<ContestacaoRelatorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestacaoRelatorioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContestacaoRelatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
