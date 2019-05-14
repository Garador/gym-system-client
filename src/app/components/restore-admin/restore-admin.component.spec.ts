import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreAdminComponent } from './restore-admin.component';

describe('RestoreAdminComponent', () => {
  let component: RestoreAdminComponent;
  let fixture: ComponentFixture<RestoreAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestoreAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestoreAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
