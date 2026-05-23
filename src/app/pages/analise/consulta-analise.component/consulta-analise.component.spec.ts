import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAnaliseComponent } from './consulta-analise.component';

describe('ConsultaAnaliseComponent', () => {
  let component: ConsultaAnaliseComponent;
  let fixture: ComponentFixture<ConsultaAnaliseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaAnaliseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaAnaliseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
