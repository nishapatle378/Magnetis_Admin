import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtmIndexComponent } from './ctm-index.component';

describe('CtmIndexComponent', () => {
  let component: CtmIndexComponent;
  let fixture: ComponentFixture<CtmIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CtmIndexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CtmIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
