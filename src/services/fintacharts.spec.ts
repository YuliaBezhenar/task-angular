import { TestBed } from '@angular/core/testing';

import { Fintacharts } from './fintacharts';

describe('Fintacharts', () => {
  let service: Fintacharts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fintacharts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
