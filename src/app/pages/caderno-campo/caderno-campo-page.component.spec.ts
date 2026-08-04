import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadernoCampoPageComponent } from './caderno-campo-page.component';

describe('CadernoCampoPageComponent', () => {
  let component: CadernoCampoPageComponent;
  let fixture: ComponentFixture<CadernoCampoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadernoCampoPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadernoCampoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
