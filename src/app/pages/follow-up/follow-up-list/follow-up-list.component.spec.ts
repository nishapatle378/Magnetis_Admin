import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpListComponent } from './follow-up-list.component';

describe('FollowUpListComponent', () => {
  let component: FollowUpListComponent;
  let fixture: ComponentFixture<FollowUpListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FollowUpListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowUpListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
