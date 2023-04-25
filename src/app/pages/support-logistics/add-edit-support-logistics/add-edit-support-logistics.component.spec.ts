import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSupportLogisticsComponent } from './add-edit-support-logistics.component';

describe('AddEditSupportLogisticsComponent', () => {
  let component: AddEditSupportLogisticsComponent;
  let fixture: ComponentFixture<AddEditSupportLogisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditSupportLogisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSupportLogisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
