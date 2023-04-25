import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SysParamSortComponent } from './sys-param-sort.component';

describe('SysParamSortComponent', () => {
  let component: SysParamSortComponent;
  let fixture: ComponentFixture<SysParamSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SysParamSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SysParamSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
