import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestacaoAnalistaComponent } from './contestacao-analista.component';

describe('ContestacaoAnalistaComponent', () => {
  let component: ContestacaoAnalistaComponent;
  let fixture: ComponentFixture<ContestacaoAnalistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestacaoAnalistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContestacaoAnalistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
