import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogContentDetailsComponent } from './log-content-details.component';

describe('LogContentDetailsComponent', () => {
  let component: LogContentDetailsComponent;
  let fixture: ComponentFixture<LogContentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogContentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogContentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
