import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroGlebaComponent } from './cadastro-gleba.component';

describe('CadastroGlebaComponent', () => {
  let component: CadastroGlebaComponent;
  let fixture: ComponentFixture<CadastroGlebaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroGlebaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroGlebaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
