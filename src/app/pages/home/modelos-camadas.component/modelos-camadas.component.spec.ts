import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelosCamadasComponent } from './modelos-camadas.component';

describe('ModelosCamadasComponent', () => {
  let component: ModelosCamadasComponent;
  let fixture: ComponentFixture<ModelosCamadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelosCamadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelosCamadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
