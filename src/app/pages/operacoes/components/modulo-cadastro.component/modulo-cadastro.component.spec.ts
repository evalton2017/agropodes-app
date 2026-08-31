import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuloCadastroComponent } from './modulo-cadastro.component';

describe('ModuloCadastroComponent', () => {
  let component: ModuloCadastroComponent;
  let fixture: ComponentFixture<ModuloCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuloCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuloCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
