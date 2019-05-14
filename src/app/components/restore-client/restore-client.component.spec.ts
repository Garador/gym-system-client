import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreClientComponent } from './restore-client.component';

describe('RestoreClientComponent', () => {
  let component: RestoreClientComponent;
  let fixture: ComponentFixture<RestoreClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestoreClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
