import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPagingComponent } from './search-paging.component';

describe('SearchPagingComponent', () => {
  let component: SearchPagingComponent;
  let fixture: ComponentFixture<SearchPagingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPagingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
