import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllSupportLogisticsComponent } from './view-all-support-logistics.component';

describe('ViewAllSupportLogisticsComponent', () => {
  let component: ViewAllSupportLogisticsComponent;
  let fixture: ComponentFixture<ViewAllSupportLogisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAllSupportLogisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllSupportLogisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
