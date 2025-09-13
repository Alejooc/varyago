import { TestBed } from '@angular/core/testing';

import { MetaCapi } from './meta-capi';

describe('MetaCapi', () => {
  let service: MetaCapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaCapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
