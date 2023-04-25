import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateServiceStatusComponent } from './update-service-status.component';

describe('UpdateServiceStatusComponent', () => {
  let component: UpdateServiceStatusComponent;
  let fixture: ComponentFixture<UpdateServiceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateServiceStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateServiceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
