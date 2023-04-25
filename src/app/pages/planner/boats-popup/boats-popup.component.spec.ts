import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoatsPopupComponent } from './boats-popup.component';

describe('BoatsPopupComponent', () => {
  let component: BoatsPopupComponent;
  let fixture: ComponentFixture<BoatsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoatsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoatsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
