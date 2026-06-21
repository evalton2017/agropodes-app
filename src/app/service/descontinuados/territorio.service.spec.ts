import { TestBed } from '@angular/core/testing';

import { TerritorioService } from './territorio.service';

describe('TerritorioService', () => {
  let service: TerritorioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerritorioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
