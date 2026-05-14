import { TestBed } from '@angular/core/testing';

import { ConsultaCarService } from './consulta-car.service';

describe('ConsultaCarService', () => {
  let service: ConsultaCarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultaCarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
