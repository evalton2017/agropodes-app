import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaCarComponent } from './consulta-car.component';

describe('ConsultaCarComponent', () => {
  let component: ConsultaCarComponent;
  let fixture: ComponentFixture<ConsultaCarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaCarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
