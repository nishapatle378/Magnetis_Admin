import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewUpdateComponent } from './crew-update.component';

describe('CrewUpdateComponent', () => {
  let component: CrewUpdateComponent;
  let fixture: ComponentFixture<CrewUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrewUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrewUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
