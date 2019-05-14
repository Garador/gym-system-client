import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { IClientCreationPayload, IPaymentAddPayload, IClientCreationResult } from '../../libs/interfaces/User';
import { UserService } from '../../libs/services/user/user.service';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import * as moment from 'moment';
import { PAYMENT_METHODS } from '../../libs/enums/PaymentMethods';
import { IRequests } from '../../libs/interfaces/Socket';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { FORM_FORMATS } from '../../libs/enums/Forms';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { Currency } from '../../libs/models/Currency';

@Component({
  selector: 'app-incorporate-client',
  templateUrl: './incorporate-client.component.html',
  styleUrls: ['./incorporate-client.component.scss']
})
export class IncorporateClientComponent implements OnInit, AfterViewInit {

  private _clientIncorporationForm: FormGroup;

  constructor(
    public userService: UserService, 
    public paymentService: PaymentService,
    public ref: ChangeDetectorRef,
    public loadingService:LoadingService) {
    this._clientIncorporationForm = new FormGroup({
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
      month_ammount: new FormControl(``,[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.paymentAmmountRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      inscription_date: new FormControl(moment().format(FORM_FORMATS.DATE),[
        (control:AbstractControl)=>{
          return null;
          /*
          if(control.value && this._clientIncorporationForm && this._clientIncorporationForm.controls['cut_date'].value){
            let cutDate = moment(this._clientIncorporationForm.controls['cut_date'].value, FORM_FORMATS.DATE);
            let inscriptionDate = moment(control.value, FORM_FORMATS.DATE);
            return cutDate.isAfter(inscriptionDate) ? null : {invalidDateValue: true};
          }else{
            return {invalidDateValue: true};
          }
          */
        }
      ]),
      cut_date: new FormControl(moment().add('1','month').format(FORM_FORMATS.DATE),[
        (control:AbstractControl)=>{
          if(control.value && this._clientIncorporationForm && this._clientIncorporationForm.controls['inscription_date'].value){
            let cutDate = moment(control.value, FORM_FORMATS.DATE);
            let inscriptionDate = moment(this._clientIncorporationForm.controls['inscription_date'].value, FORM_FORMATS.DATE);
            return cutDate.isAfter(inscriptionDate) ? null : {invalidDateValue: true};
          }else{
            return {invalidDateValue: true};
          }
        }
      ])
    });
  }

  ngOnInit() {
  }

  setDefaultDates(){
    this._clientIncorporationForm.controls['cut_date'].setValue(moment().add('1','month').format(FORM_FORMATS.DATE));
    this._clientIncorporationForm.controls['inscription_date'].setValue(moment().format(FORM_FORMATS.DATE));
  }

  ngAfterViewInit(){
    try{
      //(<any>$(".js-date")).datepicker();
      console.log("View init...");
    }catch(e){
      console.log(e);
    }
  }

  async incorporateClient(){
    //this._userService.logIn()
    if(!this._clientIncorporationForm.valid){      
      return;
    }
    await this.paymentService.currencyService.loadCurrencies();
    let currency = this.paymentService.currencyService.currencies.find((currencyA:Currency)=>{
      return /VE./i.test(currencyA.id);
    });

    this._clientIncorporationForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._clientIncorporationForm.controls['document_content'].value)
    );
    let clientCreationPayload:IClientCreationPayload = {
      firstName: this._clientIncorporationForm.controls['firstname'].value,
      surName: this._clientIncorporationForm.controls['surname'].value,
      address: this._clientIncorporationForm.controls['address'].value,
      phone: this._clientIncorporationForm.controls['phone'].value, 
      document: {
          prefix: DOCUMENT_PREFIXES.CI,
          content: this._clientIncorporationForm.controls['document_content'].value,
          image: null
      },
      membership: {
        cutDate:moment(this._clientIncorporationForm.controls['cut_date'].value, FORM_FORMATS.DATE).toDate().getTime(),
        monthAmmount:this.paymentService.ammountToInteger(`${this._clientIncorporationForm.controls['month_ammount'].value}`, currency.decimals),
        inscriptionDate: moment(this._clientIncorporationForm.controls['inscription_date'].value, FORM_FORMATS.DATE).toDate().getTime()
      }
    };

    this.loadingService.displayBasicLoading();
    let clientCreationResult = await this.userService.incorporateClient(clientCreationPayload);
    //console.log(` clientCreationResult: `,clientCreationResult);
    if(
      (typeof clientCreationResult.payload.content === "string") 
      || (!clientCreationResult.payload.content.created))
    {
      this.loadingService.hideBasicLoading();
      return;
    }

    this.loadingService.hideBasicLoading();
  }

  cleanForm(){
    this._clientIncorporationForm.reset();
    this.ref.detectChanges();
  }

  cancel() {
    let modal = $('.uk-modal').filter(function () {
      return $(this).css("display") === 'block'
    })[0];
    if(modal){
      (<any>UIkit.modal(
        $(modal)
      )).hide();
    }
  }
}
