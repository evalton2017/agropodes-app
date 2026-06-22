import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelAnaliseComponent } from './painel-analise.component';

describe('PainelAnaliseComponent', () => {
  let component: PainelAnaliseComponent;
  let fixture: ComponentFixture<PainelAnaliseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelAnaliseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelAnaliseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
