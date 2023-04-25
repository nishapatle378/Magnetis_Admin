import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpSettingComponent } from './smtp-setting.component';

describe('SmtpSettingComponent', () => {
  let component: SmtpSettingComponent;
  let fixture: ComponentFixture<SmtpSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmtpSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmtpSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
