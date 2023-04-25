import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllVendorComponent } from './view-all-vendor.component';

describe('ViewAllVendorComponent', () => {
  let component: ViewAllVendorComponent;
  let fixture: ComponentFixture<ViewAllVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAllVendorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
