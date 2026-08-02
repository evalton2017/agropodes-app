import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlebasListTs } from './glebas-list.ts';

describe('GlebasListTs', () => {
  let component: GlebasListTs;
  let fixture: ComponentFixture<GlebasListTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlebasListTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlebasListTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
