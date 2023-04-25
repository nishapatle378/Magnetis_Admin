import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllCrewHandelingComponent } from './view-all-crew-handeling.component';

describe('ViewAllCrewHandelingComponent', () => {
  let component: ViewAllCrewHandelingComponent;
  let fixture: ComponentFixture<ViewAllCrewHandelingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAllCrewHandelingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllCrewHandelingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
