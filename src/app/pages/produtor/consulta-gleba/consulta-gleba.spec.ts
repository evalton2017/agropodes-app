import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaGleba } from './consulta-gleba';

describe('ConsultaGleba', () => {
  let component: ConsultaGleba;
  let fixture: ComponentFixture<ConsultaGleba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaGleba]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaGleba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
