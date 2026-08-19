import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioProdutorComponent } from './relatorio-produtor.component';

describe('RelatorioProdutorComponent', () => {
  let component: RelatorioProdutorComponent;
  let fixture: ComponentFixture<RelatorioProdutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioProdutorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatorioProdutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
