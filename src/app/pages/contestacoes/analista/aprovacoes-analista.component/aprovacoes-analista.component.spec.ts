import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovacoesAnalistaComponent } from './aprovacoes-analista.component';

describe('AprovacoesAnalistaComponent', () => {
  let component: AprovacoesAnalistaComponent;
  let fixture: ComponentFixture<AprovacoesAnalistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovacoesAnalistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprovacoesAnalistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
