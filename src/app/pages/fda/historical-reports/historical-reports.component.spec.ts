import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalReportsComponent } from './historical-reports.component';

describe('HistoricalReportsComponent', () => {
  let component: HistoricalReportsComponent;
  let fixture: ComponentFixture<HistoricalReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoricalReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
