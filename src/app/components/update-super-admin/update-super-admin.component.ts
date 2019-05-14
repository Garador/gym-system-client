import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ISuperAdminUpdatePayload, ISuperAdminUpdateResult } from '../../libs/interfaces/User';
import { SuperAdminUpdateResult } from '../../libs/enums/User';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { LoadingService } from '../../libs/services/loading/loading.service';

@Component({
  selector: 'app-update-super-admin',
  templateUrl: './update-super-admin.component.html',
  styleUrls: ['./update-super-admin.component.scss']
})
export class UpdateSuperAdminComponent implements OnInit {

  private static _password:string;
  private _superAdminUpdateForm: FormGroup;

  constructor(
    public userService: UserService, 
    public notificationService: NotificationService,
    public loadingService:LoadingService,
    private ref: ChangeDetectorRef) {
    this._superAdminUpdateForm = new FormGroup({
      username: new FormControl("",[
        (control: AbstractControl)=>{
          return ((!control.value && !control.pristine) || SyntaxValidationProvider.Instance.validateUsername(control.value)) ? null : {invalidSyntax:true};
        }
      ]),
      firstname: new FormControl("",[
        (control: AbstractControl)=>{
          return ((!control.value && !control.pristine) || SyntaxValidationProvider.Instance.validateFirstName(control.value)) ? null : {invalidSyntax:true};
        }
      ]),
      surname: new FormControl("",[
        (control: AbstractControl)=>{
          return ((!control.value && !control.pristine) || SyntaxValidationProvider.Instance.validateSurName(control.value)) ? null : {invalidSyntax:true};
        }
      ]),
      password: new FormControl("",[
        (control: AbstractControl)=>{
          return ((!control.value && !control.pristine) || SyntaxValidationProvider.Instance.validatePassword(control.value)) ? null : {invalidSyntax:true};
        }
      ])
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit(){
  }

  public setPassword(password:string){
    UpdateSuperAdminComponent._password = password;
  }

  async updateSuperadmin(){
    let payload:ISuperAdminUpdatePayload = {
      username:this._superAdminUpdateForm.controls["username"].value,
      password:this._superAdminUpdateForm.controls["password"].value,
      firstName:this._superAdminUpdateForm.controls["firstname"].value,
      surName:this._superAdminUpdateForm.controls["surname"].value
    }
    //this.loadingService.displayBasicLoading(true);
    let resultA = await this.userService.updateSuperAdmin(UpdateSuperAdminComponent._password, payload);
    if(typeof resultA.payload !== "string"){
      this.notificationService.showSuperAdminUpdateNotification(<SuperAdminUpdateResult>(<ISuperAdminUpdateResult>resultA.payload).result);
    }else{
      this.notificationService.showSocketErrorNotification(resultA.payload);
    }
    //this.loadingService.hideBasicLoading();
    //UIkit.modal('#updateSuperAdmin').hide();
    this.cancel();
    //*/
    this._superAdminUpdateForm.reset();
  }

  cancel(){
    this._superAdminUpdateForm.reset();
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
