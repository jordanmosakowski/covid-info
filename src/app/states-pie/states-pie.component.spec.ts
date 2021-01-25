import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatesPieComponent } from './states-pie.component';

describe('StatesPieComponent', () => {
  let component: StatesPieComponent;
  let fixture: ComponentFixture<StatesPieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatesPieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatesPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
