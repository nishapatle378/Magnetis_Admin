import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailToVendorComponent } from './email-to-vendor.component';

describe('EmailToVendorComponent', () => {
  let component: EmailToVendorComponent;
  let fixture: ComponentFixture<EmailToVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailToVendorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailToVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
