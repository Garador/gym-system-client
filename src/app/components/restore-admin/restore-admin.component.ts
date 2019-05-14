import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { UserService } from '../../libs/services/user/user.service';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { toJson } from '../../libs/interfaces/Socket';
import { ClientStatus } from '../../libs/enums/User';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { DialogMessages } from '../../libs/enums/UserMessages';

@Component({
  selector: 'app-restore-admin',
  templateUrl: './restore-admin.component.html',
  styleUrls: ['./restore-admin.component.scss']
})
export class RestoreAdminComponent implements OnInit {

  private _adminRestoreForm: FormGroup;

  constructor(private _userService: UserService
    ,public loadingService: LoadingService
    ,public notificationService: NotificationService) {
    this._adminRestoreForm = new FormGroup({
      document_content: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax: true};
        }
      ])
    });
  }

  ngOnInit() {
  }

  async restoreAdmin(user:toJson.IUser){
    if(!user){
      this._adminRestoreForm.controls['document_content'].setValue(
        SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._adminRestoreForm.controls['document_content'].value)
      );
      let fetchResult = await this._userService.fetchAdminByDocument(DOCUMENT_PREFIXES.CI, this._adminRestoreForm.controls['document_content'].value);
      if(fetchResult.length>0){
        //Cliente encontrado.
        let admin:toJson.IUser = fetchResult[0];
        if(admin.status == ClientStatus.ACTIVE){        
          this.notificationService.notifyDialog(DialogMessages.RESTORE_ADMIN.ALREADY_RESTORED, <any>{stack:true});
          return;
        }
        let restoreAdmin = await this.notificationService.confirmDialog(DialogMessages.RESTORE_ADMIN.CONFIRM.replace('${1}',admin.firstName), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
        if(restoreAdmin){
          let result = await this._userService.restoreAdmin(admin.id);
          console.log(result);
        }
      }else{
        this.notificationService.notifyDialog(DialogMessages.RESTORE_ADMIN.NOT_FOUND, <any>{stack:true});
      }
    }else{
      let admin:toJson.IUser = user;
      if(admin.status == ClientStatus.ACTIVE){        
        this.notificationService.notifyDialog(DialogMessages.RESTORE_ADMIN.ALREADY_RESTORED, <any>{stack:true});
        return;
      }
      let restoreAdmin = await this.notificationService.confirmDialog(DialogMessages.RESTORE_ADMIN.CONFIRM.replace('${1}',admin.firstName), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
      if(restoreAdmin){
        let result = await this._userService.restoreAdmin(admin.id);
        console.log(result);
      }
    }
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
