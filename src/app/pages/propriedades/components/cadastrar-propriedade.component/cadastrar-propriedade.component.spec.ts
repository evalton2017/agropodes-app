import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarPropriedadeComponent } from './cadastrar-propriedade.component';

describe('CadastrarPropriedadeComponent', () => {
  let component: CadastrarPropriedadeComponent;
  let fixture: ComponentFixture<CadastrarPropriedadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarPropriedadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastrarPropriedadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
