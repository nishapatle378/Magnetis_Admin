import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOutgoingAwbComponent } from './update-outgoing-awb.component';

describe('UpdateOutgoingAwbComponent', () => {
  let component: UpdateOutgoingAwbComponent;
  let fixture: ComponentFixture<UpdateOutgoingAwbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateOutgoingAwbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateOutgoingAwbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
