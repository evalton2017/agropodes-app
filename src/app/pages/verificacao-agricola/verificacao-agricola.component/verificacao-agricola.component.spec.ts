import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacaoAgricolaComponent } from './verificacao-agricola.component';

describe('VerificacaoAgricolaComponent', () => {
  let component: VerificacaoAgricolaComponent;
  let fixture: ComponentFixture<VerificacaoAgricolaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificacaoAgricolaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificacaoAgricolaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
