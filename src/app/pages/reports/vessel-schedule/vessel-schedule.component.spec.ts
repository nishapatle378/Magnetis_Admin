import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselScheduleComponent } from './vessel-schedule.component';

describe('VesselScheduleComponent', () => {
  let component: VesselScheduleComponent;
  let fixture: ComponentFixture<VesselScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VesselScheduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
