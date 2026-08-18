import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutorMapaComponent } from './dashboard-produtor-mapa.component';

describe('DashboardProdutorMapaComponent', () => {
  let component: DashboardProdutorMapaComponent;
  let fixture: ComponentFixture<DashboardProdutorMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutorMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutorMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
