import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagamentoProdutorComponentTs } from './pagamento-produtor.component.ts';

describe('PagamentoProdutorComponentTs', () => {
  let component: PagamentoProdutorComponentTs;
  let fixture: ComponentFixture<PagamentoProdutorComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoProdutorComponentTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagamentoProdutorComponentTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
