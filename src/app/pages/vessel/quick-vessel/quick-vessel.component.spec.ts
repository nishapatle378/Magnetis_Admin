import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickVesselComponent } from './quick-vessel.component';

describe('QuickVesselComponent', () => {
  let component: QuickVesselComponent;
  let fixture: ComponentFixture<QuickVesselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickVesselComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
