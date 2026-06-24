import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtestadosPageComponentTs } from './atestados-page.component.ts';

describe('AtestadosPageComponentTs', () => {
  let component: AtestadosPageComponentTs;
  let fixture: ComponentFixture<AtestadosPageComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtestadosPageComponentTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtestadosPageComponentTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
