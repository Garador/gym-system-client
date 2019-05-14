import { Component, OnInit, ChangeDetectorRef, Input, NgZone, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { UserService } from '../../libs/services/user/user.service';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { IClientCreationPayload, IPaymentAddPayload, IClientUpdatePayload, IClientUpdateResult } from '../../libs/interfaces/User';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { PAYMENT_METHODS } from '../../libs/enums/PaymentMethods';
import {FORM_FORMATS} from '../../libs/enums/Forms';
import * as moment from 'moment';
import { toJson } from '../../libs/interfaces/Socket';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { DialogMessages } from '../../libs/enums/UserMessages';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { Currency } from '../../libs/models/Currency';

@Component({
  selector: 'app-update-client',
  templateUrl: './update-client.component.html',
  styleUrls: ['./update-client.component.scss']
})
export class UpdateClientComponent implements OnInit, AfterViewInit {

  private _clientUpdateForm: FormGroup;
  private _searchForm: FormGroup;
  public actualUser: toJson.IUser;
  public modalRef: any;

  constructor(
    public userService: UserService, 
    public paymentService: PaymentService,
    public notificationService: NotificationService,
    private ref: ChangeDetectorRef,
    private ngZone: NgZone,
    private loadingService:LoadingService) {
    this.paymentService.currencyService.loadCurrencies();
    this._clientUpdateForm = new FormGroup({
      document_content: new FormControl(``,[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ]),
      firstname: new FormControl("",[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.firstNameRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      surname: new FormControl("",[
        (control: AbstractControl)=>{
          return SyntaxValidationProvider.surNameRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      address: new FormControl("",[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.addressRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      phone: new FormControl(``,[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.phoneValidatorRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      inscription_date: new FormControl('',[
        (control:AbstractControl)=>{
          return null;
        }
      ]),
      month_ammount: new FormControl('',[
        (control:AbstractControl)=>{
          return null;
        }
      ]),
      cut_date: new FormControl('',[
        (control:AbstractControl)=>{
          if(control.value && this._clientUpdateForm && this._clientUpdateForm.controls['inscription_date'].value){
            let cutDate = moment(control.value, FORM_FORMATS.DATE);
            let inscriptionDate = moment(this._clientUpdateForm.controls['inscription_date'].value, FORM_FORMATS.DATE);
            return cutDate.isAfter(inscriptionDate) ? null : {invalidDateValue: true};
          }else{
            return {invalidDateValue: true};
          }
        }
      ])
    });

    this._searchForm = new FormGroup({
      document_content: new FormControl(``,[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ])
    });
  }
  ngOnInit() {
    
  }

  ngAfterViewInit(){
    try{
      /*
      (<any>$(".js-date")).datepicker({
        onSelect: (dateText, inst) => {
          console.log("Updating data...");
        }
      })
      .on('changeDate', function(){
        console.log("Date change detected...");
      });
      */
    }catch(e){
      console.log("Exception caught.");
      console.log(e);
    }
  }

  async loadUser(user:toJson.IUser){
    this._clientUpdateForm.controls['document_content'].setValue((<toJson.IDocument>user.document).content);
    this._clientUpdateForm.controls['firstname'].setValue(user.firstName);
    this._clientUpdateForm.controls['surname'].setValue(user.surName);
    this._clientUpdateForm.controls['phone'].setValue(user.phone);
    this._clientUpdateForm.controls['address'].setValue(user.address);
    this._clientUpdateForm.controls['inscription_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).inscriptionDate)).format(FORM_FORMATS.DATE));
    this._clientUpdateForm.controls['cut_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).cutDate)).format(FORM_FORMATS.DATE));    
    
    let currency = this.paymentService.currencyService.currencies.find((currencyA:Currency)=>{
      return /VE./i.test(currencyA.id);
    });
    this._clientUpdateForm.controls['month_ammount']
    .setValue(this.paymentService
      .integerToFloat((<toJson.IMembership>user.membership).monthAmmount, currency.decimals));
    this.actualUser = user;
    this.ref.detectChanges();
  }

  cleanForm(){
    this._clientUpdateForm.reset();
    //this._searchForm.reset();
    this.ref.detectChanges();
  }

  async searchClient(){
    this._searchForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._searchForm.controls['document_content'].value)
    );
    let userResult = await this.userService.fetchClientByDocument(DOCUMENT_PREFIXES.CI, this._searchForm.controls['document_content'].value, ['document','membership']);
    if(userResult.length>0){
      this.loadUser(userResult[0]);
    }else{
      this.notificationService.notifyDialog(DialogMessages.UPDATE_CLIENT.NOT_FOUND, <any>{stack:true})
      this.actualUser = null;
      this.cleanForm();
    }
  }

  async updateClient(){
    console.log(this._clientUpdateForm.value);
    //return;
    if(!this._clientUpdateForm.valid || !this.actualUser){
      return;
    }
    
    this._clientUpdateForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._clientUpdateForm.controls['document_content'].value)
    );
    let currency = this.paymentService.currencyService.currencies.find((currencyA:Currency)=>{
      return /VE./i.test(currencyA.id);
    });
    let clientCreationPayload:IClientUpdatePayload = {
      firstName: this._clientUpdateForm.controls['firstname'].value,
      surName: this._clientUpdateForm.controls['surname'].value,
      address: this._clientUpdateForm.controls['address'].value,
      phone: this._clientUpdateForm.controls['phone'].value, 
      document: {
          prefix: DOCUMENT_PREFIXES.CI,
          content: this._clientUpdateForm.controls['document_content'].value,
          image: null
      },
      membership: {
        cutDate:moment(this._clientUpdateForm.controls['cut_date'].value, FORM_FORMATS.DATE).toDate().getTime()
        ,inscriptionDate: moment(this._clientUpdateForm.controls['inscription_date'].value, FORM_FORMATS.DATE).toDate().getTime()
        ,monthAmmount: this.paymentService.ammountToInteger(`${this._clientUpdateForm.controls['month_ammount'].value}`, currency.decimals)
      }
    };
    this.loadingService.displayBasicLoading();
    await this.userService.updateClient(this.actualUser.id, clientCreationPayload);
    this.loadingService.hideBasicLoading();
  }
  
  cancel(){
    this.ngZone.run(()=>{
      try{
        (<any>UIkit.modal(this.modalRef)).hide();
        this.ref.detectChanges();
      }catch(e){

      }
    });
  }
}
