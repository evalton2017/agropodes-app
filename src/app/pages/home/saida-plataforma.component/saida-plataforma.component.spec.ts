import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaidaPlataformaComponent } from './saida-plataforma.component';

describe('SaidaPlataformaComponent', () => {
  let component: SaidaPlataformaComponent;
  let fixture: ComponentFixture<SaidaPlataformaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaidaPlataformaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaidaPlataformaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
