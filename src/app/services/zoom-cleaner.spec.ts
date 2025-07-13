import { TestBed } from '@angular/core/testing';

import { ZoomCleaner } from './zoom-cleaner';

describe('ZoomCleaner', () => {
  let service: ZoomCleaner;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoomCleaner);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
