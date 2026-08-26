import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoCarPanelComponent } from './resultado-car-panel.component';

describe('ResultadoCarPanelComponent', () => {
  let component: ResultadoCarPanelComponent;
  let fixture: ComponentFixture<ResultadoCarPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoCarPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoCarPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
