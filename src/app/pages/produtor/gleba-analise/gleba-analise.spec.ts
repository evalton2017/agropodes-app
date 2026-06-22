import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlebaAnalise } from './gleba-analise';

describe('GlebaAnalise', () => {
  let component: GlebaAnalise;
  let fixture: ComponentFixture<GlebaAnalise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlebaAnalise]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlebaAnalise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
