import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlebaDetalhe } from './gleba-detalhe';

describe('GlebaDetalhe', () => {
  let component: GlebaDetalhe;
  let fixture: ComponentFixture<GlebaDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlebaDetalhe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlebaDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
