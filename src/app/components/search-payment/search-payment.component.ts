import { Component,   OnInit,   ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SearchOptions, FORM_FORMATS } from '../../libs/enums/Forms';
import * as moment from 'moment';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { toJson } from '../../libs/interfaces/Socket';
import { SORT_OPTIONS, DATABASE_SERVICE_EVENTS } from '../../libs/enums/Database';
import { AppComponent } from '../../app.component';
import { IPaymentSearchOption } from '../../libs/interfaces/Payment';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { SearchOption, SortOptions, PagingOptions, SearchPaging } from '../../libs/interfaces/Search';
import { SearchPagingComponent } from '../search-paging/search-paging.component';
import { LoadUserComponent } from '../load-user/load-user.component';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../libs/services/user/user.service';
import { PaymentDetailComponent } from '../payment-detail/payment-detail.component';
import { UIKitHelper } from '../../libs/helpers/UIKitHelper';



@Component({
  selector: 'app-search-payment',
  templateUrl: './search-payment.component.html',
  styleUrls: ['./search-payment.component.scss']
})
export class SearchPaymentComponent implements OnInit, SearchPaging {


  @ViewChild("searchPagingComponent")
  searchPagingComponent: SearchPagingComponent

  @ViewChild("paymentDetailComponent")
  paymentDetailComponent: PaymentDetailComponent;

  private searches: number = 0;
  private _searchForm: FormGroup;
  private _paymentResults: toJson.IPayment[] = [];
  public STEP_SIZE = 10;
  private includedRelationships = ['membership', 'currency', 'user'];

  @ViewChild("loadUserComponent")
  loadUserComponent: LoadUserComponent;

  private includedUser:toJson.IUser;

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
    payment: {
      field: 'createdAt',
      order: SORT_OPTIONS.ASC,
      active: false,
      fieldOrder: {
        "createdAt": SORT_OPTIONS.ASC
      }
    },
    membership: {
      field: 'foreign_key_user',
      order: SORT_OPTIONS.ASC,
      active: false,
      fieldOrder: {
        "foreign_key_user": SORT_OPTIONS.ASC
      }
    }
  }
  public pagingOptions: PagingOptions = {
    limit: this.STEP_SIZE,
    offset: 0
  }

  constructor(
    private loadingService: LoadingService,
    private paymentService: PaymentService,
    private route: ActivatedRoute, 
    private userService: UserService,
    public ref: ChangeDetectorRef
  ) {
    this.paymentService.currencyService.loadCurrencies();
    this._searchForm = new FormGroup({
      notes: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      payment_method: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      ammount: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      ammount_search_option: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      created_at: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ]),
      created_at_search_option: new FormControl('', [
        (control: AbstractControl) => {
          return null;
        }
      ])
    });
    this.route.queryParams.subscribe((queryParams)=>{
      if(queryParams['user'] !== undefined){
        if(!isNaN(parseInt(queryParams['user']))){
          if(!this.userService.databaseService.initialized){
            this.userService.databaseService.subject.subscribe(async (eventID:DATABASE_SERVICE_EVENTS)=>{
              if(eventID === DATABASE_SERVICE_EVENTS.SERVICE_LOADED){
                this.loadClient(parseInt(queryParams['user']));
              }
            });
          }else{
            this.loadClient(parseInt(queryParams['user']));
          }
        }
      }
    });
  }

  public async loadClient(clientID?:number){
    this.includedUser = (await this.userService.fetchClientByID(clientID, ['membership','document']))[0];
    this.search();
  }

  public getFormattedPaymentAmmount(payment: toJson.IPayment) {
    let currency = this.paymentService.currencyService.currencies.find((currency) => {
      return (currency.id === ( < toJson.ICurrency > < any > payment.currency).id);
    })
    return `${this.paymentService.integerToAmmount(payment.ammount, currency.decimals)} ${currency.displayName}`;
  }

  public addPayment(){
    AppComponent.mainNavBar.addPayment(this.includedUser);
    //3.352.5448
  }

  ngOnInit() {

  }

  public async viewDetails(payment:toJson.IPayment){
    let user:toJson.IUser;
    if(this.includedUser){
      user = this.includedUser;
    }else{
      user = (await this.userService.fetchClientByID((<toJson.IUser><any>(<toJson.IMembership>payment.membership).user).id, ['document','membership']))[0];
    }
    this.paymentDetailComponent.loadForm(user, payment);
    UIKitHelper.Instance.showModalRemovingDuplicates('.viewPaymentDetailsModal');
  }


  ngAfterViewInit() {
    this.searchPagingComponent.setCaller(this);
  }

  async search() {
    if (this.searches == 0) {
      this.searches++;
      this.sortSearch('payment', 'createdAt');
    }
    let searchOptions: IPaymentSearchOption = this.getSortedPayload(this.getSearchPayload());
    this.loadingService.displayBasicLoading();
    let paymentRequestResults = await this.paymentService.searchPayment(searchOptions);
    if(paymentRequestResults instanceof Array){
      this._paymentResults = paymentRequestResults;
    }else{
      this._paymentResults = [];
    }
    this.loadingService.hideBasicLoading();
    this.ref.detectChanges();
    this.searches++;
  }

  //35.666.584
  public async loadUser(){
    this.includedUser = await this.loadUserComponent.requestUser(1, ['membership','document']);
    this.ref.detectChanges();
  }

  public removeUser(){
    this.includedUser = null;
    this.ref.detectChanges();
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

  public getSortedPayload(searchOptions: IPaymentSearchOption) {
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

  public getSearchPayload(): IPaymentSearchOption {
    let searchOptions: IPaymentSearchOption = {
      where: {},
      paging: this.pagingOptions,
      includedRelations: this.includedRelationships
    };

    if (!!this._searchForm.controls['notes'].value) {
      searchOptions.where.payment = (searchOptions.where.payment instanceof Object) ? searchOptions.where.payment : {};
      searchOptions.where.payment.content = (searchOptions.where.payment.content instanceof Object) ? searchOptions.where.payment.content : {};
      searchOptions.where.payment.content.notes = {
        like: `%${this._searchForm.controls['notes'].value}%`
      };
    }

    if(this.includedUser && this.includedUser.membership){
      searchOptions.where.payment = (searchOptions.where.payment instanceof Object) ? searchOptions.where.payment : {};
      searchOptions.where.payment.content = (searchOptions.where.payment.content instanceof Object) ? searchOptions.where.payment.content : {};
      searchOptions.where.payment.content.foreign_key_membership = {
        equal:(this.includedUser.membership instanceof Object) ? (<toJson.IMembership>this.includedUser.membership).id : this.includedUser.membership
      };
    }

    if (this._searchForm.controls['ammount'].value !== undefined &&
      !isNaN(parseInt(this._searchForm.controls['ammount'].value))
    ) {
      searchOptions.where.payment = (searchOptions.where.payment instanceof Object) ? searchOptions.where.payment : {};
      searchOptions.where.payment.content = (searchOptions.where.payment.content instanceof Object) ? searchOptions.where.payment.content : {};
      switch (SearchOptions.PAYMENT[this._searchForm.controls['ammount_search_option'].value]) {
        case SearchOptions.PAYMENT.EQUAL_TO:
          searchOptions.where.payment.content.ammount = {
            greater: this.paymentService.ammountToInteger(`${this._searchForm.controls['ammount'].value-1}`, 2),
            lesser: this.paymentService.ammountToInteger(`${this._searchForm.controls['ammount'].value+1}`, 2)
          }
          break;
        case SearchOptions.PAYMENT.GREATHER_THAN:
          searchOptions.where.payment.content.ammount = {
            greater: this.paymentService.ammountToInteger(`${this._searchForm.controls['ammount'].value}`, 2)
          }
          break;
        case SearchOptions.PAYMENT.LESSER_THAN:
          searchOptions.where.payment.content.ammount = {
            lesser: this.paymentService.ammountToInteger(`${this._searchForm.controls['ammount'].value}`, 2)
          }
          break;
        default:
          break;
      }
    }


    if (!!this._searchForm.controls['created_at'].value &&
      (moment(this._searchForm.controls['created_at'].value, FORM_FORMATS.DATE)).isValid()
    ) {

      searchOptions.where.payment = (searchOptions.where.payment instanceof Object) ? searchOptions.where.payment : {};
      searchOptions.where.payment.meta = (searchOptions.where.payment.meta instanceof Object) ? searchOptions.where.payment.meta : {};

      switch (SearchOptions.DATE[this._searchForm.controls['created_at_search_option'].value]) {
        case SearchOptions.DATE.EQUAL_TO:
          searchOptions.where.payment.meta.createdAt = {
            greater: moment(this._searchForm.controls['created_at'].value, FORM_FORMATS.DATE).subtract(1, "day").toDate(),
            lesser: moment(this._searchForm.controls['created_at'].value, FORM_FORMATS.DATE).add(1, "day").toDate(),
          }
          break;
        case SearchOptions.DATE.GREATHER_THAN:
          searchOptions.where.payment.meta.createdAt = {
            greater: moment(this._searchForm.controls['created_at'].value, FORM_FORMATS.DATE).toDate()
          }
          break;
        case SearchOptions.DATE.LESSER_THAN:
          searchOptions.where.payment.meta.createdAt = {
            lesser: moment(this._searchForm.controls['created_at'].value, FORM_FORMATS.DATE).toDate()
          }
          break;
        default:
          break;
      }
    }
    return searchOptions;
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

  public async next() {
    if (!this.isSorted) {
      return;
    }
    let previousOffset = this.pagingOptions.limit;
    this.pagingOptions.offset += this.STEP_SIZE;
    await this.search();
    if (this._paymentResults.length < 1) {
      this.pagingOptions.offset -= previousOffset;
    }
  }

  public async previous() {
    if (!this.isSorted) {
      return;
    }
    if (this.pagingOptions.offset < 1) {
      return;
    }
    let previousOffset = this.pagingOptions.offset + 0;
    this.pagingOptions.offset -= this.STEP_SIZE;
    await this.search();
    if (this._paymentResults.length < 1) {
      this.pagingOptions.offset = previousOffset;
    }
  }

}
