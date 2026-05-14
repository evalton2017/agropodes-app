import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaProdesComponent } from './consulta-prodes.component';

describe('ConsultaProdesComponent', () => {
  let component: ConsultaProdesComponent;
  let fixture: ComponentFixture<ConsultaProdesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaProdesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaProdesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
