import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FdaListComponent } from './fda-list.component';

describe('FdaListComponent', () => {
  let component: FdaListComponent;
  let fixture: ComponentFixture<FdaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FdaListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FdaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
