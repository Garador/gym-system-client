import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSuperadminComponent } from './create-superadmin.component';

describe('CreateSuperadminComponent', () => {
  let component: CreateSuperadminComponent;
  let fixture: ComponentFixture<CreateSuperadminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSuperadminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSuperadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
