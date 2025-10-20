import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTrustbar } from './product-trustbar';

describe('ProductTrustbar', () => {
  let component: ProductTrustbar;
  let fixture: ComponentFixture<ProductTrustbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTrustbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTrustbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
