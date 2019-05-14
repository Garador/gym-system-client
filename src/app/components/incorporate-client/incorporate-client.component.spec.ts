import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncorporateClientComponent } from './incorporate-client.component';

describe('IncorporateClientComponent', () => {
  let component: IncorporateClientComponent;
  let fixture: ComponentFixture<IncorporateClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncorporateClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncorporateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
