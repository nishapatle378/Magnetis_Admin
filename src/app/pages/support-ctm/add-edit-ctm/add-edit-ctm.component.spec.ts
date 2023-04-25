import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCtmComponent } from './add-edit-ctm.component';

describe('AddEditCtmComponent', () => {
  let component: AddEditCtmComponent;
  let fixture: ComponentFixture<AddEditCtmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditCtmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditCtmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
