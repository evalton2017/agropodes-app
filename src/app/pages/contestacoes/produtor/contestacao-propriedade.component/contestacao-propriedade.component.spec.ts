import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestacaoPropriedadeComponent } from './contestacao-propriedade.component';

describe('ContestacaoPropriedadeComponent', () => {
  let component: ContestacaoPropriedadeComponent;
  let fixture: ComponentFixture<ContestacaoPropriedadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestacaoPropriedadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContestacaoPropriedadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
