import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtestadoDetalhadoComponent } from './atestado-detalhado.component';

describe('AtestadoDetalhadoComponent', () => {
  let component: AtestadoDetalhadoComponent;
  let fixture: ComponentFixture<AtestadoDetalhadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtestadoDetalhadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtestadoDetalhadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
