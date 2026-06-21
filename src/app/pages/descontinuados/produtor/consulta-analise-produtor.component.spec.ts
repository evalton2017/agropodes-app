import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAnaliseProdutorComponent } from './consulta-analise-produtor.component';

describe('ConsultaAnaliseProdutorComponent', () => {
  let component: ConsultaAnaliseProdutorComponent;
  let fixture: ComponentFixture<ConsultaAnaliseProdutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaAnaliseProdutorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaAnaliseProdutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
