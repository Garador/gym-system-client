import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SearchOptions, FORM_FORMATS } from '../../libs/enums/Forms';
import { IUserSearchOptions } from '../../libs/interfaces/User';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import * as moment from 'moment';
import { UserService } from '../../libs/services/user/user.service';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { toJson } from '../../libs/interfaces/Socket';
import { SORT_OPTIONS } from '../../libs/enums/Database';
import { AdminStatus } from '../../libs/enums/User';
import {AppComponent} from '../../app.component';
import { SearchOption, SortOptions, PagingOptions, SearchPaging } from '../../libs/interfaces/Search';
import { SearchPagingComponent } from '../search-paging/search-paging.component';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';

@Component({
  selector: 'app-search-admin',
  templateUrl: './search-admin.component.html',
  styleUrls: ['./search-admin.component.scss']
})
export class SearchAdminComponent implements OnInit, SearchPaging {

  private searches:number = 0;
  private _searchForm: FormGroup;
  private _userResults:toJson.IUser[] = [];
  public STEP_SIZE = 10;
  public ADMIN_STATUS = AdminStatus;
  public readonly includedRelations:string[] = ['document','login','role'];


  @ViewChild("searchPagingComponent")
  searchPagingComponent: SearchPagingComponent;

  public SEARCH_OPTIONS_DATE = (()=>{
    let options:SearchOption[] = [];
    Object.keys(SearchOptions.DATE)
    .forEach((option)=>{
      options.push({
        title: SearchOptions.DATE[option],
        value: option
      });
    });
    return options;
  })();
  private _sortOptions:SortOptions = {
    login:{
      field:'username',
      order:SORT_OPTIONS.ASC,
      active:false,
      fieldOrder:{
        "username":SORT_OPTIONS.ASC
      }
    },
    document:{
      field:'content',
      order:SORT_OPTIONS.ASC,
      active:false,
      fieldOrder:{
        "content":SORT_OPTIONS.ASC
      }
    },
    user:{
      field:'name',
      order:SORT_OPTIONS.ASC,
      active:false,
      fieldOrder:{
        "name":SORT_OPTIONS.ASC
      }
    },
  }
  public pagingOptions:PagingOptions = {
    limit: this.STEP_SIZE,
    offset:0
  }

  public SEARCH_OPTIONS_STATUS = (()=>{
    let options:SearchOption[] = [];
    Object.keys(SearchOptions.STATUS_ADMIN)
    .forEach((option)=>{
      options.push({
        title: SearchOptions.STATUS_ADMIN[option],
        value: option
      });
    });
    return options;
  })();

  constructor(
    private userService:UserService,
    private loadingService: LoadingService,
    public ref: ChangeDetectorRef
  ) {
    this._searchForm = new FormGroup({
      firstname: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      surname: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      document_content: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      address: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      phone: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      status: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ])
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.searchPagingComponent.setCaller(this);
    //this.ref.detectChanges();
  }
  
  async search(){
      if(this.searches == 0){
        this.searches++;
        this.sortSearch('document','content');
      }
      let searchOptions:IUserSearchOptions = this.getSortedPayload(this.getSearchPayload());
      this.loadingService.displayBasicLoading();
      let results = await this.userService.searchAdmin(searchOptions); 
      if(results instanceof Array){
        this._userResults = results;
      }else{
        this._userResults = [];
      }
      this.loadingService.hideBasicLoading();      
      this.ref.detectChanges();
      this.searches++;
  }

  public async sortSearch(table:string, field:string){
    if(!this._sortOptions[table]){
      return;
    }
    Object.keys(this._sortOptions).forEach((tableIndex)=>{
      this._sortOptions[tableIndex].active = false;
    });
    this._sortOptions[table].field = field;
    this._sortOptions[table].active = true;
    this._sortOptions[table].order = (this._sortOptions[table].order !== undefined) ? (()=>{
      return (this._sortOptions[table].order === SORT_OPTIONS.ASC) ? SORT_OPTIONS.DESC : SORT_OPTIONS.ASC;
    })() : SORT_OPTIONS.ASC;
    this._sortOptions[table].fieldOrder[this._sortOptions[table].field] = this._sortOptions[table].order;
    this.search();
  }

  public getSortedPayload(searchOptions:IUserSearchOptions){
    let optionIndex = Object.keys(this._sortOptions).find((optionIndex)=>{
      return this._sortOptions[optionIndex].active;
    });
    if(optionIndex != undefined){
      searchOptions.orderBy = {
        [optionIndex]:{
          [this._sortOptions[optionIndex].field]: this._sortOptions[optionIndex].order
        }
      }
    }
    return searchOptions;
  }

  public isSortAscending(tableName:string, fieldName:string): boolean {
    if(this._sortOptions[tableName]){
      return (this._sortOptions[tableName].fieldOrder[fieldName] !== undefined) ?
        this._sortOptions[tableName].fieldOrder[fieldName] === SORT_OPTIONS.ASC :
        (()=>{
          this._sortOptions[tableName].fieldOrder[fieldName] = SORT_OPTIONS.ASC;
          return true;
        })();
    }else{
      return true;
    }
  }

  public getSearchPayload():IUserSearchOptions{
    let searchOptions:IUserSearchOptions = {
      where:{},
      paging:this.pagingOptions,
      includedRelations: this.includedRelations
    };
    if(!!this._searchForm.controls['firstname'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.content = (searchOptions.where.user.content instanceof Object) ? searchOptions.where.user.content : {};
      searchOptions.where.user.content.name = {
        like:`%${this._searchForm.controls['firstname'].value}%`
      };
    }
    if(!!this._searchForm.controls['surname'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.content = (searchOptions.where.user.content instanceof Object) ? searchOptions.where.user.content : {};
      searchOptions.where.user.content.surname = {
        like:`%${this._searchForm.controls['surname'].value}%`
      };
    }
    if(!!this._searchForm.controls['address'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.content = (searchOptions.where.user.content instanceof Object) ? searchOptions.where.user.content : {};
      searchOptions.where.user.content.address = {
        like:`%${this._searchForm.controls['address'].value}%`
      };
    }
    if(!!this._searchForm.controls['status'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.meta = (searchOptions.where.user.meta instanceof Object) ? searchOptions.where.user.meta : {};
      let clientStatus = AdminStatus[this._searchForm.controls['status'].value];      
      searchOptions.where.user.meta.status = {
        equal: parseInt(clientStatus)
      };
    }
    if(!!this._searchForm.controls['phone'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.content = (searchOptions.where.user.content instanceof Object) ? searchOptions.where.user.content : {};
      searchOptions.where.user.content.phone = {
        like:`%${this._searchForm.controls['phone'].value}%`
      }
    }
    this._searchForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._searchForm.controls['document_content'].value)
    );
    if(!!this._searchForm.controls['document_content'].value){
      searchOptions.where.document = (searchOptions.where.document instanceof Object) ? searchOptions.where.document : {};
      searchOptions.where.document.content = (searchOptions.where.document.content instanceof Object) ? searchOptions.where.document.content : {};
      searchOptions.where.document.content = {
        prefix:{
          equal:DOCUMENT_PREFIXES.CI
        }, content:{
          like: `%${this._searchForm.controls['document_content'].value}%`
        }
      };
    }
    return searchOptions;
  }

  public cutDatePassed(date:string){
    return moment(date).isBefore(moment());
  }

  public get isSorted(){
    let sorted = false;
    Object.keys(this._sortOptions).forEach((key:string)=>{
      if(this._sortOptions[key].active){
        sorted = true;
      }
    });
    return sorted;
  }


  async updateAdmin(user:toJson.IUser){
    AppComponent.mainNavBar.updateAdmin(user);
  }

  async removeAdmin(user:toJson.IUser){
    AppComponent.mainNavBar.removeAdmin(user);
  }

  async restoreAdmin(user:toJson.IUser){
    AppComponent.mainNavBar.restoreAdmin(user);
  }

  async viewAdminDetails(user:toJson.IUser){
    AppComponent.mainNavBar.viewAdminDetails(user);
  }

  async reincorporateAdmin(user:toJson.IUser){
    AppComponent.mainNavBar.restoreAdmin(user);
  }

}
