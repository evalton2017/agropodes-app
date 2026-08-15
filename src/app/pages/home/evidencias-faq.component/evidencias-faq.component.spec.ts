import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenciasFaqComponent } from './evidencias-faq.component';

describe('EvidenciasFaqComponent', () => {
  let component: EvidenciasFaqComponent;
  let fixture: ComponentFixture<EvidenciasFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenciasFaqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvidenciasFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
