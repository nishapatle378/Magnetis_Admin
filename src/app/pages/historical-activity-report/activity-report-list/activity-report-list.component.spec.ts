import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityReportListComponent } from './activity-report-list.component';

describe('ActivityReportListComponent', () => {
  let component: ActivityReportListComponent;
  let fixture: ComponentFixture<ActivityReportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityReportListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
