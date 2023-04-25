import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllBoatLogComponent } from './view-all-boat-log.component';

describe('ViewAllBoatLogComponent', () => {
  let component: ViewAllBoatLogComponent;
  let fixture: ComponentFixture<ViewAllBoatLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAllBoatLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllBoatLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
