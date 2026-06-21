import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarTerritorioTs } from './cadastra-territorio.ts.ts';

describe('CadastrarTerritorioTs', () => {
  let component: CadastrarTerritorioTs;
  let fixture: ComponentFixture<CadastrarTerritorioTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarTerritorioTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastrarTerritorioTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
