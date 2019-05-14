import { Component, OnInit } from '@angular/core';
import {SearchPaging} from '../../libs/interfaces/Search';

@Component({
  selector: 'app-search-paging',
  templateUrl: './search-paging.component.html',
  styleUrls: ['./search-paging.component.scss']
})
export class SearchPagingComponent implements OnInit {

  public caller:Object;

  constructor() { }

  ngOnInit() {
    
  }

  setCaller(object:Object){
    this.caller = object;
  }

  public async next() {
    if (!(<SearchPaging>this.caller).isSorted) {
      return;
    }
    (<SearchPaging>this.caller).pagingOptions.offset += (<SearchPaging>this.caller).STEP_SIZE;
    await (<SearchPaging>this.caller).search();
  }

  public async previous() {
    if (!(<SearchPaging>this.caller).isSorted) {
      return;
    }
    if ((<SearchPaging>this.caller).pagingOptions.offset < 1) {
      return;
    }
    (<SearchPaging>this.caller).pagingOptions.offset -= (<SearchPaging>this.caller).STEP_SIZE;
    await (<SearchPaging>this.caller).search();
  }

  public async resetPaging() {
    (<SearchPaging>this.caller).pagingOptions = {
      limit: (<SearchPaging>this.caller).STEP_SIZE,
      offset: 0
    };
    await (<SearchPaging>this.caller).search();
  }

  



}
