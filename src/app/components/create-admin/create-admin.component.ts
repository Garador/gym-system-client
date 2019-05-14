import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { IAdminCreationPayload, IAdminCreationResult } from '../../libs/interfaces/User';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { LoadingService } from '../../libs/services/loading/loading.service';

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.scss']
})
export class CreateAdminComponent implements OnInit {

  private _userService: UserService;
  private _adminCreationForm: FormGroup;

  constructor(userService: UserService, public loadingService: LoadingService, public ref:ChangeDetectorRef) {
    this._userService = userService;
    this._adminCreationForm = new FormGroup({
      username: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateUsername(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      firstname: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateFirstName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      surname: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateSurName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      address: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateAddress(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      phone: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validatePhone(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      password: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validatePassword(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      document_content: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ])
    });
  }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    this.ref.detectChanges();
  }

  resetForm(){
    this._adminCreationForm.reset();
  }

  async createAdmin(){
    //this._userService.logIn()
    if(!this._adminCreationForm.valid){
      console.log(this._adminCreationForm);
      return;
    }
    this._adminCreationForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._adminCreationForm.controls['document_content'].value)
    );
    let payload:IAdminCreationPayload = {
      username:this._adminCreationForm.controls["username"].value,
      password:this._adminCreationForm.controls["password"].value,
      firstName:this._adminCreationForm.controls["firstname"].value,
      surName:this._adminCreationForm.controls["surname"].value,
      phone: this._adminCreationForm.controls["phone"].value,
      address: this._adminCreationForm.controls["address"].value,
      document:{
        prefix: DOCUMENT_PREFIXES.CI,
        content: this._adminCreationForm.controls["document_content"].value,
        image: null
      }
    }
    this.loadingService.displayBasicLoading();
    let resultA = await this._userService.generateAdmin(payload);
    this.loadingService.hideBasicLoading();
    return resultA;
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
