import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewHandleingPopupComponent } from './crew-handleing-popup.component';

describe('CrewHandleingPopupComponent', () => {
  let component: CrewHandleingPopupComponent;
  let fixture: ComponentFixture<CrewHandleingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrewHandleingPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrewHandleingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
