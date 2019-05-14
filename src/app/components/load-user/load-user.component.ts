import { Component,  OnInit, Input } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup,  FormControl,  Validators,  AbstractControl } from '@angular/forms';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { DOCUMENT_PREFIXES  } from '../../libs/base/DocumentPrefixes';
import { toJson } from '../../libs/interfaces/Socket';
import { ClientStatus } from '../../libs/enums/User';
import { NotificationService  } from '../../libs/services/notification/notification.service';
import { DialogMessages  } from '../../libs/enums/UserMessages';
import { User  } from '../../libs/models/User';
import { Subject, TimeInterval } from 'rxjs';


@Component({
  selector: 'app-load-user',
  templateUrl: './load-user.component.html',
  styleUrls: ['./load-user.component.scss']
})
export class LoadUserComponent implements OnInit {
  private _fetchUserForm: FormGroup;
  public subject = new Subject<any>();
  public loadedUser:toJson.IUser;
  public userType:number;
  public additionalTables:string[];

  constructor(private _userService: UserService, 
    private notificationService: NotificationService,
  public loadingService: LoadingService) {
    this._fetchUserForm = new FormGroup({
      document_content: new FormControl("", [
        (control: AbstractControl) => {
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {
            invalidSyntax: true
          };
        }
      ])
    });
  }

  ngOnInit() {
  }

  public async requestUser(userType:number, additionalTables?: string[]){ //1: Client. 2: Admin.
    this._fetchUserForm.controls['document_content'].setValue("");
    this.additionalTables = additionalTables;
    this.userType = userType;
    await new Promise((accept)=>{
      let userModal = UIkit.modal('#fetchUserModal');
      (<any>userModal).toggle();
      console.log(userModal);

      let intervalA:any;
      let subscriber = this.subject.subscribe(function(code){
        if(code == 1){
          clearInterval(intervalA);
          subscriber.unsubscribe();
          if((<any>userModal).isToggled()){
            (<any>userModal).toggle();
          }
          accept();
        }
      });
      intervalA = setInterval(()=>{
        if(!(<any>userModal).isToggled()){
          clearInterval(intervalA);
          this.loadedUser = null;
          accept();
        }
      },300);
    });
    return this.loadedUser;
  }

  async selectUser(){
    this._fetchUserForm.controls['document_content'].setValue(
      SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._fetchUserForm.controls['document_content'].value)
    );
    if(this.userType == 1){      
      this.loadedUser = (await this._userService.fetchClientByDocument(DOCUMENT_PREFIXES.CI, this._fetchUserForm.controls['document_content'].value, this.additionalTables))[0];
      if(!this.loadedUser){
        this.notificationService.alert(DialogMessages.LOAD_USER_COMPONENT.NOT_FOUND_CLIENT);
        //this.notificationService.confirmDialog(DialogMessages.LOAD_USER_COMPONENT.NOT_FOUND_CLIENT, <any>{stack: true, labels: {"ok": "Cerrar", "cancel":"Cerrar"}});
      }
    }else{
      this.loadedUser =  (await this._userService.fetchAdminByDocument(DOCUMENT_PREFIXES.CI, this._fetchUserForm.controls['document_content'].value, this.additionalTables))[0];
      if(!this.loadedUser){
        this.notificationService.alert(DialogMessages.LOAD_USER_COMPONENT.NOT_FOUND_ADMIN);
        //this.notificationService.confirmDialog(DialogMessages.LOAD_USER_COMPONENT.NOT_FOUND_ADMIN, <any>{stack: true, labels: {"ok": "Cerrar", "cancel":"Cerrar"}});
      }
    }
    this.subject.next(1);
  }

}
