import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { UserService } from '../../libs/services/user/user.service';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import {FORM_FORMATS} from '../../libs/enums/Forms';
import * as moment from 'moment';
import { toJson } from '../../libs/interfaces/Socket';
import { NotificationService } from '../../libs/services/notification/notification.service';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {

  private _clientDetailsForm: FormGroup;
  public actualUser: toJson.IUser;

  constructor(
    public userService: UserService, 
    public paymentService: PaymentService,
    public notificationService: NotificationService,
    private ref: ChangeDetectorRef) {
    this._clientDetailsForm = new FormGroup({
      document_content: new FormControl({value:'', disabled:true},[
        (control: AbstractControl)=>{
          //return {invalidSyntax:true};
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ]),
      firstname: new FormControl({value:'',disabled:true},[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.firstNameRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      surname: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return SyntaxValidationProvider.surNameRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      address: new FormControl({value:'',disabled:true},[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.addressRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      phone: new FormControl({value:'',disabled:true},[
        (control:AbstractControl)=>{
          return SyntaxValidationProvider.phoneValidatorRegEx.test(control.value) ? null : {invalidSyntax:true};
        }
      ]),
      inscription_date: new FormControl({value:'',disabled:true},[
        (control:AbstractControl)=>{
          return null;
        }
      ]),
      month_ammount: new FormControl({value:'',disabled:true},[
        (control:AbstractControl)=>{
          return null;
        }
      ]),
      cut_date: new FormControl({value:'',disabled:true},[
        (control:AbstractControl)=>{
          return null;
        }
      ])
    });
  }
  ngOnInit() {
    
  }

  loadUser(user:toJson.IUser){
    this._clientDetailsForm.controls['document_content'].setValue((<toJson.IDocument>user.document).content);
    this._clientDetailsForm.controls['firstname'].setValue(user.firstName);
    this._clientDetailsForm.controls['surname'].setValue(user.surName);
    this._clientDetailsForm.controls['phone'].setValue(user.phone);
    this._clientDetailsForm.controls['address'].setValue(user.address);
    this._clientDetailsForm.controls['inscription_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).inscriptionDate)).format(FORM_FORMATS.DATE));
    this._clientDetailsForm.controls['cut_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).cutDate)).format(FORM_FORMATS.DATE));
    this._clientDetailsForm.controls['month_ammount'].setValue(SyntaxValidationProvider.Instance.integerToFloat((<toJson.IMembership>user.membership).monthAmmount, 2));
    this.actualUser = user;
    this.ref.detectChanges();
  }

  cleanForm(){
    this._clientDetailsForm.reset();
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
