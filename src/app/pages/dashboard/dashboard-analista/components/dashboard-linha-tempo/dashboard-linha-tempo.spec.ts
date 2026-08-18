import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLinhaTempo } from './dashboard-linha-tempo';

describe('DashboardLinhaTempo', () => {
  let component: DashboardLinhaTempo;
  let fixture: ComponentFixture<DashboardLinhaTempo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLinhaTempo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardLinhaTempo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
