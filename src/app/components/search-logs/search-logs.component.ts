import { Component,   OnInit,   ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SearchOptions, FORM_FORMATS } from '../../libs/enums/Forms';
import * as moment from 'moment';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { toJson } from '../../libs/interfaces/Socket';
import { SORT_OPTIONS } from '../../libs/enums/Database';
import {LogService} from '../../libs/services/log/log.service';
import { ILogSearchOptions } from '../../libs/interfaces/Log';
import {LogActions} from '../../libs/enums/Log';
import {SearchPaging, SortOptions, PagingOptions, SearchOption} from '../../libs/interfaces/Search';
import {SearchPagingComponent} from '../search-paging/search-paging.component';
import { LoadUserComponent } from '../load-user/load-user.component';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { LogContentDetailsComponent } from '../log-content-details/log-content-details.component';
import {UIKitHelper} from '../../libs/helpers/UIKitHelper';


@Component({
  selector: 'app-search-logs',
  templateUrl: './search-logs.component.html',
  styleUrls: ['./search-logs.component.scss']
})
export class SearchLogsComponent implements OnInit, SearchPaging {

  private searches: number = 0;
  private _searchForm: FormGroup;
  private _logResults: toJson.ILog[] = [];
  public STEP_SIZE = 10;
  private includedRelationships = ['user'];
  private includedUser:toJson.IUser;

  @ViewChild("searchPagingComponent")
  searchPagingComponent: SearchPagingComponent

  @ViewChild("loadUserComponent")
  loadUserComponent: LoadUserComponent;

  @ViewChild("logContentDetailsComponent")
  logContentDetailsComponent: LogContentDetailsComponent;


  public SEARCH_OPTIONS_DATE = (() => {
    let options: SearchOption[] = [];
    Object.keys(SearchOptions.DATE)
      .forEach((option) => {
        options.push({
          title: SearchOptions.DATE[option],
          value: option
        });
      });
    return options;
  })();

  public SEARCH_OPTIONS_AMMOUNT = (() => {
    let options: SearchOption[] = [];
    Object.keys(SearchOptions.PAYMENT)
      .forEach((option) => {
        options.push({
          title: SearchOptions.PAYMENT[option],
          value: option
        });
      });
    return options;
  })();

  public SEARCH_OPTIONS_ACTION = (() => {
    let options: SearchOption[] = [];
    Object.keys(SearchOptions.LOG_ACTION)
      .forEach((option) => {
        options.push({
          title: SearchOptions.LOG_ACTION[option],
          value: option
        });
      });
    return options;
  })();

  public SEARCH_OPTIONS_STATUS = (() => {
    let options: SearchOption[] = [];
    Object.keys(SearchOptions.STATUS)
      .forEach((option) => {
        options.push({
          title: SearchOptions.STATUS[option],
          value: option
        });
      });
    return options;
  })();

  private _sortOptions: SortOptions = {
    log: {
      field: 'action_time',
      order: SORT_OPTIONS.ASC,
      active: false,
      fieldOrder: {
        "action_time": SORT_OPTIONS.ASC
      }
    },
    user: {
      field: 'name',
      order: SORT_OPTIONS.ASC,
      active: false,
      fieldOrder: {
        "name": SORT_OPTIONS.ASC
      }
    }
  }

  public pagingOptions: PagingOptions = {
    limit: this.STEP_SIZE,
    offset: 0
  }

  constructor(
    private loadingService: LoadingService,
    private logService: LogService,
    public ref: ChangeDetectorRef,
    public notificationService: NotificationService,
    public ngZone:NgZone
  ) {
    this._searchForm = new FormGroup({
      action_performed: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      event_time: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      event_time_search_option: new FormControl('', [
        (control: AbstractControl) =>{
          return null;
        }
      ]),
      user: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ])
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.searchPagingComponent.setCaller(this);
    //this.ref.detectChanges();
  }

  removeUser(){
    this.includedUser = null;
    this.ref.detectChanges();
  }

  public async loadUser(){
    this.includedUser = await this.loadUserComponent.requestUser(2);
    this.ref.detectChanges();
  }

  public async viewLogData(jLogData:toJson.ILog){
    let fullLog = (await this.logService.searchLogs({
      where:{
        log:{
          meta:{
            id:{
              equal: jLogData.id
            }
          }
        }
      },
      includedRelations:['log_content']
    }))[0];
    
    this.ngZone.run(()=>{
      this.logContentDetailsComponent.log = fullLog;
      UIKitHelper.Instance.showModalRemovingDuplicates('.logContentDetailsModal');      
    });
    this.ref.detectChanges();
  }

  async search() {
    if (this.searches == 0) {
      this.searches++;
      this.sortSearch('log', 'event_time');
      return;
    }

    let searchOptions:ILogSearchOptions = this.getSortedPayload(this.getSearchPayload());
    this.loadingService.displayBasicLoading();
    let results = await this.logService.searchLogs(searchOptions);
    if(results instanceof Array){
      this._logResults = results;  
    }else{
      this._logResults = [];
    }
    this.loadingService.hideBasicLoading();      
    this.ref.detectChanges();
    this.searches++;
  }

  public async sortSearch(table: string, field: string) {
    if (!this._sortOptions[table]) {
      return;
    }
    Object.keys(this._sortOptions).forEach((optionIndex) => {
      this._sortOptions[optionIndex].active = false;
    });
    this._sortOptions[table].field = field;
    this._sortOptions[table].active = true;
    this._sortOptions[table].order = (this._sortOptions[table].order !== undefined) ? (() => {
      return (this._sortOptions[table].order === SORT_OPTIONS.ASC) ? SORT_OPTIONS.DESC : SORT_OPTIONS.ASC;
    })() : SORT_OPTIONS.ASC;
    this._sortOptions[table].fieldOrder[this._sortOptions[table].field] = this._sortOptions[table].order;
    this.search();
  }

  public getSortedPayload(searchOptions: ILogSearchOptions) {
    let optionIndex = Object.keys(this._sortOptions).find((optionIndex) => {
      return this._sortOptions[optionIndex].active;
    });
    if (optionIndex != undefined) {
      searchOptions.orderBy = {
        [optionIndex]: {
          [this._sortOptions[optionIndex].field]: this._sortOptions[optionIndex].order
        }
      }
    }
    return searchOptions;
  }

  public isSortAscending(tableName: string, fieldName: string): boolean {
    if (this._sortOptions[tableName]) {
      return (this._sortOptions[tableName].fieldOrder[fieldName] !== undefined) ?
        this._sortOptions[tableName].fieldOrder[fieldName] === SORT_OPTIONS.ASC :
        (() => {
          this._sortOptions[tableName].fieldOrder[fieldName] = SORT_OPTIONS.ASC;
          return true;
        })();
    } else {
      return true;
    }
  }

  public getSearchPayload(): ILogSearchOptions {
    let searchOptions: ILogSearchOptions = {
      where: {},
      paging: this.pagingOptions,
      includedRelations: this.includedRelationships
    };

    if (this._searchForm.controls['action_performed'].value !== undefined) {
      searchOptions.where.log = (searchOptions.where.log instanceof Object) ? searchOptions.where.log : {};
      searchOptions.where.log.content = (searchOptions.where.log.content instanceof Object) ? searchOptions.where.log.content : {};
      searchOptions.where.log.content.action_performed = {
        equal: <any>LogActions[this._searchForm.controls['action_performed'].value]
      };
    }

    if(this.includedUser){
      searchOptions.where.log = (searchOptions.where.log instanceof Object) ? searchOptions.where.log : {};
      searchOptions.where.log.content = (searchOptions.where.log.content instanceof Object) ? searchOptions.where.log.content : {};
      searchOptions.where.log.content.foreign_key_user = {
        equal: this.includedUser.id
      };
    }

    
    if (!!this._searchForm.controls['event_time'].value &&
      (moment(this._searchForm.controls['event_time'].value, FORM_FORMATS.DATE)).isValid()
    ) {

      searchOptions.where.log = (searchOptions.where.log instanceof Object) ? searchOptions.where.log : {};
      searchOptions.where.log.content = (searchOptions.where.log.content instanceof Object) ? searchOptions.where.log.content : {};

      switch (SearchOptions.DATE[this._searchForm.controls['event_time_search_option'].value]) {
        case SearchOptions.DATE.EQUAL_TO:
          searchOptions.where.log.content.event_time = {
            greater: moment(this._searchForm.controls['event_time'].value, FORM_FORMATS.DATE).subtract(1, "day").toDate(),
            lesser: moment(this._searchForm.controls['event_time'].value, FORM_FORMATS.DATE).add(1, "day").toDate(),
          }
          break;
        case SearchOptions.DATE.GREATHER_THAN:
          searchOptions.where.log.content.event_time = {
            greater: moment(this._searchForm.controls['event_time'].value, FORM_FORMATS.DATE).toDate()
          }
          break;
        case SearchOptions.DATE.LESSER_THAN:
          searchOptions.where.log.content.event_time = {
            lesser: moment(this._searchForm.controls['event_time'].value, FORM_FORMATS.DATE).toDate()
          }
          break;
        default:
          break;
      }
    }
    return searchOptions;
  }

  public getAction(jLog:toJson.ILog){
    return SearchOptions.LOG_ACTION[LogActions[jLog.action]];
  }

  public getUser(jLog:toJson.ILog){
    return jLog.user ? (<toJson.IUser>jLog.user).firstName : "";
  }

  public cutDatePassed(cutDate: string) {
    return moment(cutDate).isBefore(moment());
  }

  public get isSorted() {
    let sorted = false;
    Object.keys(this._sortOptions).forEach((key: string) => {
      if (this._sortOptions[key].active) {
        sorted = true;
      }
    });
    return sorted;
  }

}
