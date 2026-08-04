import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadernoCampoDetalhadoComponent } from './caderno-campo-detalhado.component';

describe('CadernoCampoDetalhadoComponent', () => {
  let component: CadernoCampoDetalhadoComponent;
  let fixture: ComponentFixture<CadernoCampoDetalhadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadernoCampoDetalhadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadernoCampoDetalhadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
