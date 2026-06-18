import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProdutorStatusAtividadesComponent } from './dashboard-produtor-status-atividades.component';

describe('DashboardProdutorStatusAtividadesComponent', () => {
  let component: DashboardProdutorStatusAtividadesComponent;
  let fixture: ComponentFixture<DashboardProdutorStatusAtividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProdutorStatusAtividadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProdutorStatusAtividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
