import { TestBed } from '@angular/core/testing';

import { MetaPixel } from './meta-pixel';

describe('MetaPixel', () => {
  let service: MetaPixel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaPixel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
