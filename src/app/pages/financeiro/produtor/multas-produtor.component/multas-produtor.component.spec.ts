import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultasProdutorComponent } from './multas-produtor.component';

describe('MultasProdutorComponent', () => {
  let component: MultasProdutorComponent;
  let fixture: ComponentFixture<MultasProdutorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultasProdutorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultasProdutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
