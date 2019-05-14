import { Component, OnInit, ChangeDetectorRef, ViewChild, Injector, NgZone } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SearchOptions, FORM_FORMATS } from '../../libs/enums/Forms';
import { IUserSearchOptions } from '../../libs/interfaces/User';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import * as moment from 'moment';
import { UserService } from '../../libs/services/user/user.service';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { toJson } from '../../libs/interfaces/Socket';
import { SORT_OPTIONS } from '../../libs/enums/Database';
import { ClientStatus } from '../../libs/enums/User';
import {AppComponent} from '../../app.component';
import { SearchPaging, SearchOption, SortOptions, PagingOptions } from '../../libs/interfaces/Search';
import { SearchPagingComponent } from '../search-paging/search-paging.component';
import { Router } from '@angular/router';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';


@Component({
  selector: 'app-search-client',
  templateUrl: './search-client.component.html',
  styleUrls: ['./search-client.component.scss']
})
export class SearchClientComponent implements OnInit, SearchPaging {

  private searches:number = 0;
  private _searchForm: FormGroup;
  private _userResults:toJson.IUser[] = [];
  public STEP_SIZE = 10;
  private CLIENT_STATUS = ClientStatus;
  @ViewChild("searchPagingComponent")
  searchPagingComponent: SearchPagingComponent

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

  public SEARCH_OPTIONS_STATUS = (()=>{
    let options:SearchOption[] = [];
    Object.keys(SearchOptions.STATUS)
    .forEach((option)=>{
      options.push({
        title: SearchOptions.STATUS[option],
        value: option
      });
    });
    return options;
  })();


  private _sortOptions:SortOptions = {
    membership:{
      field:'cut_date',
      order:SORT_OPTIONS.ASC,
      active:false,
      fieldOrder:{
        "cut_date":SORT_OPTIONS.ASC
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

  constructor(
    private userService:UserService,
    private loadingService: LoadingService,
    public ref: ChangeDetectorRef,
    private routerService: Router,
    private injector: Injector
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
      cut_date: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      cut_date_search_option: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      inscription_date: new FormControl('',[
        (control: AbstractControl)=>{
          return null;
        }
      ]),
      inscription_date_search_option: new FormControl('',[
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

  ngOnInit(){

  }

  ngAfterViewInit() {
    this.searchPagingComponent.setCaller(this);
    //this.ref.detectChanges();
  }

  async updateClient(user:toJson.IUser){
    AppComponent.mainNavBar.updateClient(user);
  }

  async desincorporateClient(user:toJson.IUser){
    AppComponent.mainNavBar.desincorporateClient(user);
  }

  async viewClientDetails(user:toJson.IUser){
    AppComponent.mainNavBar.viewClientDetails(user);
  }

  async reincorporateClient(user:toJson.IUser){
    AppComponent.mainNavBar.reincorporateClient(user);
  }

  async addPayment(user:toJson.IUser){
    AppComponent.mainNavBar.addPayment(user);
  }

  async viewClientPayments(jsonU:toJson.IUser){
    const routerService = this.injector.get(Router);
    const ngZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/searchPayments'], { queryParams: { user: jsonU.id } });
    });
    //this.ref.detectChanges();
  }

  async search(){
      if(this.searches == 0){
        this.searches++;
        this.sortSearch('document','content');
      }
      let searchOptions:IUserSearchOptions = this.getSortedPayload(this.getSearchPayload());
      this.loadingService.displayBasicLoading();
      let results = await this.userService.searchClient(searchOptions);
      console.log(`
      
      results gotten: `,results,`
      
      `);
      if(results instanceof Array){
        this._userResults = results;
      }else{
        this._userResults = [];
      }
      this.loadingService.hideBasicLoading();
      this.searches++;   
      this.ref.detectChanges();
  }

  public async sortSearch(table:string, field:string){
    if(!this._sortOptions[table]){
      return;
    }
    Object.keys(this._sortOptions).forEach((optionIndex)=>{
      this._sortOptions[optionIndex].active = false;
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
      includedRelations:['document','membership']
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
    if(!!this._searchForm.controls['phone'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.content = (searchOptions.where.user.content instanceof Object) ? searchOptions.where.user.content : {};
      searchOptions.where.user.content.phone = {
        like:`%${this._searchForm.controls['phone'].value}%`
      }
    }
    if(!!this._searchForm.controls['status'].value){
      searchOptions.where.user = (searchOptions.where.user instanceof Object) ? searchOptions.where.user : {};
      searchOptions.where.user.meta = (searchOptions.where.user.meta instanceof Object) ? searchOptions.where.user.meta : {};
      let clientStatus = ClientStatus[this._searchForm.controls['status'].value];      
      searchOptions.where.user.meta.status = {
        equal: parseInt(clientStatus)
      };
    }
    if(!!this._searchForm.controls['document_content'].value){
      this._searchForm.controls['document_content'].setValue(
        SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._searchForm.controls['document_content'].value)
      );
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


    if(!!this._searchForm.controls['cut_date'].value 
      && (moment(this._searchForm.controls['cut_date'].value, FORM_FORMATS.DATE)).isValid()
    ){
      searchOptions.where.membership = (searchOptions.where.membership instanceof Object) ? searchOptions.where.membership : {};
      searchOptions.where.membership.content = (searchOptions.where.membership.content instanceof Object) ? searchOptions.where.membership.content : {};

      switch(SearchOptions.DATE[this._searchForm.controls['cut_date_search_option'].value]){
        case SearchOptions.DATE.EQUAL_TO:
          searchOptions.where.membership.content.cut_date = {
            greater: moment(this._searchForm.controls['cut_date'].value, FORM_FORMATS.DATE).subtract(1, "day").toDate(),
            lesser: moment(this._searchForm.controls['cut_date'].value, FORM_FORMATS.DATE).add(1, "day").toDate()
          }
        break;
        case SearchOptions.DATE.GREATHER_THAN:
          searchOptions.where.membership.content.cut_date = {
            greater: moment(this._searchForm.controls['cut_date'].value, FORM_FORMATS.DATE).toDate()
          }
        break;
        case SearchOptions.DATE.LESSER_THAN:
          searchOptions.where.membership.content.cut_date = {
            lesser: moment(this._searchForm.controls['cut_date'].value, FORM_FORMATS.DATE).toDate()
          }
        break;
        default:
        break;
      }
    }


    if(!!this._searchForm.controls['inscription_date'].value 
      && (moment(this._searchForm.controls['inscription_date'].value, FORM_FORMATS.DATE)).isValid()
    ){

      searchOptions.where.membership = (searchOptions.where.membership instanceof Object) ? searchOptions.where.membership : {};
      searchOptions.where.membership.content = (searchOptions.where.membership.content instanceof Object) ? searchOptions.where.membership.content : {};

      switch(SearchOptions.DATE[this._searchForm.controls['inscription_date_search_option'].value]){
        case SearchOptions.DATE.EQUAL_TO:
          searchOptions.where.membership.content.inscription_date = {
            greater: moment(this._searchForm.controls['inscription_date'].value, FORM_FORMATS.DATE).subtract(1, "day").toDate(),
            lesser: moment(this._searchForm.controls['inscription_date'].value, FORM_FORMATS.DATE).add(1, "day").toDate(),
          }
        break;
        case SearchOptions.DATE.GREATHER_THAN:
          searchOptions.where.membership.content.inscription_date = {
            greater: moment(this._searchForm.controls['inscription_date'].value, FORM_FORMATS.DATE).toDate()
          }
        break;
        case SearchOptions.DATE.LESSER_THAN:
          searchOptions.where.membership.content.inscription_date = {
            lesser: moment(this._searchForm.controls['inscription_date'].value, FORM_FORMATS.DATE).toDate()
          }
        break;
        default:
        break;
      }
    }
    return searchOptions;
  }

  public cutDatePassed(cutDate:string){
    return moment(cutDate).isBefore(moment());
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

}
