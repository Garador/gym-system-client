import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { toJson } from '../../libs/interfaces/Socket';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { PaymentService } from '../../libs/services/payment/payment.service';
import * as moment from "moment";
import { FORM_FORMATS } from '../../libs/enums/Forms';
import { DialogMessages } from '../../libs/enums/UserMessages';

@Component({
  selector: 'app-consult-client',
  templateUrl: './consult-client.component.html',
  styleUrls: ['./consult-client.component.scss']
})
export class ConsultClientComponent implements OnInit {

  
  private _clientUpdateForm: FormGroup;
  private _searchForm: FormGroup;
  private _actualUser: toJson.IUser;

  constructor(
    public userService: UserService, 
    public paymentService: PaymentService,
    public notificationService: NotificationService,
    private ref: ChangeDetectorRef) {
    this._clientUpdateForm = new FormGroup({
      document_content: new FormControl({value:'',disabled:true},[
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

  public getCutDate(date:Date){
    return moment((<toJson.IMembership>this._actualUser.membership).cutDate).format("DD/MM/YYYY");
  }

  public get upToDate(){
      return (this._actualUser && this._actualUser.membership && (moment((<toJson.IMembership>this._actualUser.membership).cutDate)).isAfter(moment())) ? 1 :
      (()=>{
        if(!this._actualUser || !this._actualUser.membership){
          return -1;
        }
        if(!(moment((<toJson.IMembership>this._actualUser.membership).cutDate)).isAfter(moment())){
          return -2;
        }
      })();
  }

  ngOnInit() {
  }

  loadUser(user:toJson.IUser){
    this._clientUpdateForm.controls['document_content'].setValue((<toJson.IDocument>user.document).content);
    this._clientUpdateForm.controls['firstname'].setValue(user.firstName);
    this._clientUpdateForm.controls['surname'].setValue(user.surName);
    this._clientUpdateForm.controls['phone'].setValue(user.phone);
    this._clientUpdateForm.controls['address'].setValue(user.address);
    this._clientUpdateForm.controls['inscription_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).inscriptionDate)).format(FORM_FORMATS.DATE));
    this._clientUpdateForm.controls['cut_date'].setValue(moment(new Date((<toJson.IMembership>user.membership).cutDate)).format(FORM_FORMATS.DATE));
    this._clientUpdateForm.controls['month_ammount'].setValue(SyntaxValidationProvider.Instance.integerToFloat((<toJson.IMembership>user.membership).monthAmmount, 2));
    //this._clientUpdateForm.updateValueAndValidity();
    this.ref.detectChanges();
  }

  cleanForm(){
    this._clientUpdateForm.controls['document_content'].setValue("");
    this._clientUpdateForm.controls['firstname'].setValue("");
    this._clientUpdateForm.controls['surname'].setValue("");
    this._clientUpdateForm.controls['phone'].setValue("");
    this._clientUpdateForm.controls['address'].setValue("");
    this._clientUpdateForm.controls['inscription_date'].setValue("");
    this._clientUpdateForm.controls['cut_date'].setValue("");
    this._clientUpdateForm.controls['month_ammount'].setValue("");
    //this._clientUpdateForm.updateValueAndValidity();
    this.ref.detectChanges();
  }

  async searchClient(){
    //625374
    this._searchForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._searchForm.controls['document_content'].value)
    );
    let userResult = await this.userService.fetchClientByDocument(DOCUMENT_PREFIXES.CI, this._searchForm.controls['document_content'].value, ['document','membership']);
    if(userResult.length>0){
      this._actualUser = userResult[0];
      this.loadUser(this._actualUser);
    }else{
      this.notificationService.notifyDialog(DialogMessages.CONSULT_CLIENT.CLIENT_NOT_FOUND, <any>{stack:true})
      this._actualUser = null;
      this.cleanForm();
    }
  }
}
