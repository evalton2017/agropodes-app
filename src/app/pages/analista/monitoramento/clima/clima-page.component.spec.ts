import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClimaPageComponent } from './clima-page.component';

describe('ClimaPageComponent', () => {
  let component: ClimaPageComponent;
  let fixture: ComponentFixture<ClimaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClimaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClimaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
