import { TestBed } from '@angular/core/testing';

import { Gtm } from './gtm';

describe('Gtm', () => {
  let service: Gtm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gtm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
