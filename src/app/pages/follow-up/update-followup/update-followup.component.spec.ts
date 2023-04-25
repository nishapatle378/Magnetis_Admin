import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFollowupComponent } from './update-followup.component';

describe('UpdateFollowupComponent', () => {
  let component: UpdateFollowupComponent;
  let fixture: ComponentFixture<UpdateFollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFollowupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
