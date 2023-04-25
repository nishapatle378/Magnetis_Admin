import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerDetailsComponent } from './planner-details.component';

describe('PlannerDetailsComponent', () => {
  let component: PlannerDetailsComponent;
  let fixture: ComponentFixture<PlannerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
