import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { IAdminUpdatePayload, IRoleUpdatePayload } from '../../libs/interfaces/User';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { toJson } from '../../libs/interfaces/Socket';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { DialogMessages } from '../../libs/enums/UserMessages';
import { LoadingService } from '../../libs/services/loading/loading.service';


interface IRoleCheck {
  fieldName:string, label:string, checked:boolean
}


@Component({
  selector: 'app-update-admin',
  templateUrl: './update-admin.component.html',
  styleUrls: ['./update-admin.component.scss']
})
export class UpdateAdminComponent implements OnInit {

  private _adminUpdateForm: FormGroup;
  private _searchForm: FormGroup;
  private _roleForm: FormGroup;
  private _actualUser: toJson.IUser;
  public modalRef:any;

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
    private notificationService: NotificationService,
    public ngZone:NgZone,
    private loadingService: LoadingService) {
    this._adminUpdateForm = new FormGroup({
      username: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.Instance.validateUsername(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      firstname: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.Instance.validateFirstName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      surname: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.Instance.validateSurName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      address: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.Instance.validateAddress(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      phone: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.Instance.validatePhone(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      password: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.Instance.validatePassword(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      document_content: new FormControl("",[
        (control: AbstractControl)=>{
          return (!control.value || SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ])
    });

    this._searchForm = new FormGroup({
      document_content: new FormControl("",[
        (control: AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax:true};
        }
      ])
    });

    this._roleForm = new FormGroup({});
    this._roleChecks.forEach(check=>{
      this._roleForm.addControl(check.fieldName, new FormControl(false, [
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

  loadUser(user:toJson.IUser){
    //+Basic Info
    this.actualUser = user;
    this._adminUpdateForm.controls['firstname'].setValue(user.firstName);
    this._adminUpdateForm.controls['surname'].setValue(user.surName);
    this._adminUpdateForm.controls['phone'].setValue(user.phone);
    this._adminUpdateForm.controls['address'].setValue(user.address);
    if(user.document){
      this._adminUpdateForm.controls['document_content'].setValue((<toJson.IDocument>user.document).content);
    }
    this._adminUpdateForm.controls['password'].setValue("");
    this._adminUpdateForm.controls['username'].setValue((<toJson.ILogin>user.login).username);
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

  async searchAdmin(){
    //123456787
    this._searchForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._searchForm.controls['document_content'].value)
    );
    let userResult = await this.userService.fetchAdminByDocument(DOCUMENT_PREFIXES.CI, this._searchForm.controls['document_content'].value, ['document','login','role']);
    if(userResult.length>0){
      this.loadUser(userResult[0]);
    }else{
      this.notificationService.notifyDialog(DialogMessages.UPDATE_ADMIN.NOT_FOUND, <any>{stack:true})      
      this.cleanForm();
    }
  }

  cleanForm(){
    this.actualUser = null;
    this._adminUpdateForm.reset();
    this._roleForm.reset();
    this.ref.detectChanges();
  }

  ngOnInit() {
  }

  async updateAdmin(){
    if(!this._adminUpdateForm.valid || !this.actualUser){
      console.log(this._adminUpdateForm);
      return;
    }
    this._adminUpdateForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._adminUpdateForm.controls['document_content'].value)
    );
    let payload:IAdminUpdatePayload = {
      username:this._adminUpdateForm.controls["username"].value,
      password:this._adminUpdateForm.controls["password"].value ? this._adminUpdateForm.controls["password"].value : null,
      firstName:this._adminUpdateForm.controls["firstname"].value,
      surName:this._adminUpdateForm.controls["surname"].value,
      phone: this._adminUpdateForm.controls["phone"].value,
      address: this._adminUpdateForm.controls["address"].value,
      document:{
        prefix: DOCUMENT_PREFIXES.CI,
        content: this._adminUpdateForm.controls['document_content'].value
      }
    }
    this.loadingService.displayBasicLoading();
    let resultA = await this.userService.updateAdmin(this.actualUser.id, payload);
    this.loadingService.hideBasicLoading();
    return resultA;
  }

  async updateAdminRole(){
    if(!this._roleForm.valid || !this.actualUser){
      return;
    }
    //Assemble role payload
    let rolePayload:IRoleUpdatePayload = {
      role:{}
    };

    this._roleChecks.forEach((check:IRoleCheck)=>{
      rolePayload.role[check.fieldName] = this._roleForm.controls[check.fieldName].value;
    });
    this.loadingService.displayBasicLoading();
    let updateResponse = await this.userService.updateAdminRole(this.actualUser.id, rolePayload);
    this.loadingService.hideBasicLoading();
  }

  cancel(){
    this.cleanForm();
    this.ngZone.run(()=>{
      (<any>UIkit.modal(this.modalRef)).hide();
      this.ref.detectChanges();
    });
  }

}
