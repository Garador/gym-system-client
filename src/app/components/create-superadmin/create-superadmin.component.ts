import { Component, OnInit } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ISuperAdminCreationPayload } from '../../libs/interfaces/User';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { LoadingService } from '../../libs/services/loading/loading.service';

@Component({
  selector: 'app-create-superadmin',
  templateUrl: './create-superadmin.component.html',
  styleUrls: ['./create-superadmin.component.scss']
})
export class CreateSuperadminComponent implements OnInit {

  private _userService: UserService;
  private _superAdminCreationForm: FormGroup;

  constructor(
    userService: UserService,
    private loadingService: LoadingService)
   {
    this._userService = userService;
    this._superAdminCreationForm = new FormGroup({
      username: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateUsername(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      firstname: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateFirstName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      surname: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validateSurName(control.value)) ? null : {invalidSyntax: true};
        }
      ]),
      password: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.Instance.validatePassword(control.value)) ? null : {invalidSyntax: true};
        }
      ])
    });
  }

  ngOnInit() {
  }

  async createSuperAdmin(){
    //this._userService.logIn()
    let payload:ISuperAdminCreationPayload = {
      username:this._superAdminCreationForm.controls["username"].value,
      password:this._superAdminCreationForm.controls["password"].value,
      firstName:this._superAdminCreationForm.controls["firstname"].value,
      surName:this._superAdminCreationForm.controls["surname"].value,
      address: "",
      phone: ""
    }
    this.loadingService.displayBasicLoading();
    let resultA = await this._userService.generateSuperAdmin(payload);
    this.loadingService.hideBasicLoading();
    console.log(`resultA: `,resultA);
  }

}
