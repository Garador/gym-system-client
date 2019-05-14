import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, ILoginData } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LogInResult } from '../../libs/enums/User';
import { AuthMessages } from '../../libs/enums/UserMessages';
import * as UIKit from 'uikit';
import { LoginCommands } from '../../libs/enums/Login';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { UpdateSuperAdminComponent } from '../update-super-admin/update-super-admin.component';
import { CurrencyService } from '../../libs/services/currency/currency.service';
import { UIKitHelper } from '../../libs/helpers/UIKitHelper';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild("superAdminUpdateComponent")
  updateSuperAdminComponent: UpdateSuperAdminComponent;

  
  private _userService: UserService;
  private _loginForm: FormGroup;
  superAdminUpdatePassword: string;

  constructor(userService: UserService
    ,public currencyService: CurrencyService
    ,public loadingService: LoadingService) {
    this._userService = userService;
    this._loginForm = new FormGroup({
      username: new FormControl("",[
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl("",[
        Validators.required,
        Validators.minLength(3),
      ])
    });
  }

  ngAfterViewInit(){
    
  }

  ngOnInit() {
  }

  close(){
    this.loadingService.hideBasicLoading();
    (<any>UIkit.modal('#loginModal')).hide();
  }

  async logIn(){
    //this._userService.logIn()
    if(this._loginForm.controls['username'].value === LoginCommands.UPDATE_SUPER_ADMIN){
      this.updateSuperAdmin(this._loginForm.controls['password'].value);
      this._loginForm.reset();
      return;
    }else if(this._loginForm.controls['username'].value === LoginCommands.CREATE_SUPER_ADMIN){
      this.createSuperAdmin();  
      this._loginForm.reset();    
      return;
    }
    let loadingModal = this.loadingService.displayBasicLoading(false);
    await this._userService.logIn(this._loginForm.controls['username'].value, this._loginForm.controls['password'].value);
    this._loginForm.reset();
    //this.loadingService.hideLoading();
    setTimeout(()=>{
      this.loadingService.hideModal(loadingModal);
    },500);
    this.currencyService.loadCurrencies();
  }

  createSuperAdmin(){
    this.cancel();
    UIKitHelper.Instance.showModalRemovingDuplicates('.createSuperAdminModal');
  }

  updateSuperAdmin(password:string){
    this.cancel();
    this.updateSuperAdminComponent.setPassword(password);
    UIKitHelper.Instance.showModalRemovingDuplicates('.updateSuperAdminModal');    
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
