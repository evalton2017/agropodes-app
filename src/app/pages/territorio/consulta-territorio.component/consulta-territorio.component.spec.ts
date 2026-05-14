import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaTerritorioComponent } from './consulta-territorio.component';

describe('ConsultaTerritorioComponent', () => {
  let component: ConsultaTerritorioComponent;
  let fixture: ComponentFixture<ConsultaTerritorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaTerritorioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaTerritorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
