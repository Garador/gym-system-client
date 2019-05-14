import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesincorporateClientComponent } from './desincorporate-client.component';

describe('DesincorporateClientComponent', () => {
  let component: DesincorporateClientComponent;
  let fixture: ComponentFixture<DesincorporateClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesincorporateClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesincorporateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
