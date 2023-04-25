import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportIndexComponent } from './transport-index.component';

describe('TransportIndexComponent', () => {
  let component: TransportIndexComponent;
  let fixture: ComponentFixture<TransportIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportIndexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
