import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioAnalistaComponent } from './relatorio-analista.component';

describe('RelatorioAnalistaComponent', () => {
  let component: RelatorioAnalistaComponent;
  let fixture: ComponentFixture<RelatorioAnalistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatorioAnalistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatorioAnalistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
