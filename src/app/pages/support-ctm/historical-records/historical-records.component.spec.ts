import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalRecordsComponent } from './historical-records.component';

describe('HistoricalRecordsComponent', () => {
  let component: HistoricalRecordsComponent;
  let fixture: ComponentFixture<HistoricalRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoricalRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
