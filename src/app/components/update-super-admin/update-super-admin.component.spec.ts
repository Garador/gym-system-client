import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSuperAdminComponent } from './update-super-admin.component';

describe('UpdateSuperAdminComponent', () => {
  let component: UpdateSuperAdminComponent;
  let fixture: ComponentFixture<UpdateSuperAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateSuperAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
