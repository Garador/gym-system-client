import { Component, OnInit } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { toJson } from '../../libs/interfaces/Socket';
import { ClientStatus, AdminStatus } from '../../libs/enums/User';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { DialogMessages } from '../../libs/enums/UserMessages';

@Component({
  selector: 'app-remove-admin',
  templateUrl: './remove-admin.component.html',
  styleUrls: ['./remove-admin.component.scss']
})
export class RemoveAdminComponent implements OnInit {

  private _removeForm: FormGroup;

  constructor(private _userService: UserService
    ,public loadingService: LoadingService
    ,public notificationService: NotificationService) {
    this._removeForm = new FormGroup({
      document_content: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax: true};
        }
      ])
    });
  }

  ngOnInit() {
  }

  async desincorporateAdmin(user:toJson.IUser){
    //1. Buscamos el cliente por la cédula.
    //2. Pedimos la desincorporación del cliente.
    //625374
    if(!user){
      this._removeForm.controls['document_content'].setValue(
        SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._removeForm.controls['document_content'].value)
      );
      let fetchResult = await this._userService.fetchAdminByDocument(DOCUMENT_PREFIXES.CI, this._removeForm.controls['document_content'].value);
      if(fetchResult.length>0){
        //Cliente encontrado.
        let admin:toJson.IUser = fetchResult[0];
        if(admin.status == AdminStatus.DELETED){        
          this.notificationService.notifyDialog(DialogMessages.REMOVE_ADMIN.ALREADY_DESINCORPORATED, <any>{stack:true})
          return;
        }
        let confirmation = await this.notificationService.confirmDialog(DialogMessages.REMOVE_ADMIN.CONFIRM.replace('${1}', admin.firstName), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
        if(confirmation){
          let result = await this._userService.removeAdmin(admin.id)
          console.log("Admin Removal Result: ",result);
        }
      }else{
        this.notificationService.notifyDialog(DialogMessages.REMOVE_ADMIN.NOT_FOUND, <any>{stack:true});
        //Cliente no encontrado...
      }
    }else{
      let admin = user;
      if(admin.status == AdminStatus.DELETED){        
        this.notificationService.notifyDialog(DialogMessages.REMOVE_ADMIN.ALREADY_DESINCORPORATED, <any>{stack:true})
        return;
      }
      let confirmation = await this.notificationService.confirmDialog(DialogMessages.REMOVE_ADMIN.CONFIRM.replace('${1}', admin.firstName), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
      if(confirmation){
        let result = await this._userService.removeAdmin(admin.id)
        console.log("Admin Removal Result: ",result);
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
