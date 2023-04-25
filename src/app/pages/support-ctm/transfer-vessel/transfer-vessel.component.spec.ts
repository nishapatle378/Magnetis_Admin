import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferVesselComponent } from './transfer-vessel.component';

describe('TransferVesselComponent', () => {
  let component: TransferVesselComponent;
  let fixture: ComponentFixture<TransferVesselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferVesselComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
