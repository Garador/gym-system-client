import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import * as moment from 'moment';
import { toJson } from '../../libs/interfaces/Socket';
import { FORM_FORMATS } from '../../libs/enums/Forms';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { Currency } from '../../libs/models/Currency';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss']
})
export class PaymentDetailComponent implements OnInit {
  _dataForm:FormGroup;

  _user:toJson.IUser;
  _payment:toJson.IPayment;

  constructor(
    private ref: ChangeDetectorRef,
    public paymentService: PaymentService
    ) {
    
    this._dataForm = new FormGroup({
      document_content: new FormControl({value:'', disabled:true},[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return null;
        }
      ]),
      firstName: new FormControl({value:'', disabled:true},[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return null;
        }
      ]),
      ammount: new FormControl({value:'', disabled:true},[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return null;
        }
      ]),
      cut_date: new FormControl({value:'', disabled:true},[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return null;
        }
      ]),
      notes: new FormControl({value:'', disabled:true},[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return null;
        }
      ])
    });

  }

  ngOnInit() {
  }

  async loadForm(user:toJson.IUser, payment:toJson.IPayment){
    await this.paymentService.currencyService.loadCurrencies();
    let currency:Currency = (typeof(payment.currency) === "object") ? 
    this.paymentService.currencyService.currencies.find((currency)=>{
      return (currency.id === (<toJson.ICurrency>payment.currency).id);
    }) : 
    this.paymentService.currencyService.currencies.find((currency)=>{
      return (currency.id === payment.currency);
    })
    this._dataForm.controls['document_content'].setValue((<toJson.IDocument>user.document).content);
    this._dataForm.controls['firstName'].setValue(user.firstName);
    this._dataForm.controls['cut_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).cutDate)).format(FORM_FORMATS.DATE));
    this._dataForm.controls['ammount'].setValue(SyntaxValidationProvider.Instance.integerToFloat(payment.ammount, currency ? currency.decimals : 2));
    this._dataForm.controls['notes'].setValue(payment.notes);
    this._user = user;
    this._payment = payment;
    this.ref.detectChanges();
  }

  cleanForm(){
    this._dataForm.controls['document_content'].setValue("");
    this._dataForm.controls['firstName'].setValue("");
    this._dataForm.controls['cut_date'].setValue("");
    this._dataForm.controls['ammount'].setValue("");
    this._dataForm.controls['notes'].setValue("");
    this.ref.detectChanges();
  }

}
