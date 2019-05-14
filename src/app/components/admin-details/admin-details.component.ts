import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { IAdminUpdatePayload, IRoleUpdatePayload } from '../../libs/interfaces/User';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { toJson } from '../../libs/interfaces/Socket';
import { NotificationService } from '../../libs/services/notification/notification.service';


interface IRoleCheck {
  fieldName:string, label:string, checked:boolean
}

@Component({
  selector: 'app-admin-details',
  templateUrl: './admin-details.component.html',
  styleUrls: ['./admin-details.component.scss']
})
export class AdminDetailsComponent implements OnInit {

  private _adminDetailsFormControl: FormGroup;
  private _roleForm: FormGroup;
  private _actualUser: toJson.IUser;

  private _roleChecks:IRoleCheck[] = [{
    fieldName:"canLogin",
    label:"Puede entrar al sistema",
    checked:false
  },{
    fieldName:"canChangePassword",
    label:"Puede actualizar la contraseña",
    checked:false
  },{
    fieldName:"canAddAdmin",
    label:"Puede añadir nuevos admins",
    checked:false
  },{
    fieldName:"canUpdateAdmin",
    label:"Puede actualizar administradores",
    checked:false
  },{
    fieldName:"canRemoveAdmin",
    label:"Puede eliminar administradores",
    checked:false
  },{
    fieldName:"canSearchAdmin",
    label:"Puede buscar adminsitradores",
    checked:false
  },{
    fieldName:"canExportData",
    label:"Puede exportar data",
    checked:false
  },{
    fieldName:"canImportData",
    label:"Puede importar data",
    checked:false
  },{
    fieldName:"canIncorporateClient",
    label:"Puede incorporar clientes",
    checked:false
  },{
    fieldName:"canUpdateClient",
    label:"Puede actualizar clientes",
    checked:false
  },{
    fieldName:"canDesincorporateClient",
    label:"Puede desincorporar clientes",
    checked:false
  },{
    fieldName:"canSearchClient",
    label:"Puede buscar clientes",
    checked:false
  },{
    fieldName:"canAddPayment",
    label:"Puede añadir pagos",
    checked:false
  },{
    fieldName:"canSearchPayment",
    label:"Puede buscar pagos",
    checked:false
  },{
    fieldName:"canUpdateUserRoles",
    label:"Puede actualizar los roles de los usuarios",
    checked:false
  }];

  constructor(public userService: UserService, 
    private ref: ChangeDetectorRef,
    private notificationService: NotificationService) {
    this._adminDetailsFormControl = new FormGroup({
      username: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateUsername(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      firstname: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateFirstName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      surname: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateSurName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      address: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateAddress(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      phone: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validatePhone(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      password: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (!control.touched || SyntaxValidationProvider.Instance.validatePassword(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      document_content: new FormControl({value:'',disabled:true},[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ])
    });

    this._roleForm = new FormGroup({});
    this._roleChecks.forEach(check=>{
      this._roleForm.addControl(check.fieldName, new FormControl({value:false,disabled:true}, [
        (control:AbstractControl)=>{
          return null;
        }
      ]));
    });
  }

  public set actualUser(user: toJson.IUser){
    this._actualUser = user;
  }

  public get actualUser(){
    return this._actualUser;
  }

  //Document
  //Role
  //Membership
  loadUser(user:toJson.IUser){
    //+Basic Info
    this.actualUser = user;
    this._adminDetailsFormControl.controls['firstname'].setValue(user.firstName);
    this._adminDetailsFormControl.controls['surname'].setValue(user.surName);
    this._adminDetailsFormControl.controls['phone'].setValue(user.phone);
    this._adminDetailsFormControl.controls['address'].setValue(user.address);
    if(user.document){
      this._adminDetailsFormControl.controls['document_content'].setValue((<toJson.IDocument>user.document).content);
    }
    this._adminDetailsFormControl.controls['password'].setValue("");
    this._adminDetailsFormControl.controls['username'].setValue((<toJson.ILogin>user.login).username);
    //-Basic Info
    //+Role
    Object.keys((<toJson.IRole>user.role))
    .forEach((keyName:string)=>{
      if(this._roleForm.controls[keyName] !== undefined){
        this._roleForm.controls[keyName].setValue((<toJson.IRole>user.role)[keyName]);
      }
    });
    //-Role
    this.ref.detectChanges();
  }

  cleanForm(){
    this.actualUser = null;
    this._adminDetailsFormControl.reset();
    this.ref.detectChanges();
  }

  ngOnInit() {
  }

  async showUpdateRolesModal(){
    UIkit.modal('#updateRolesModal').show();
  }
}
