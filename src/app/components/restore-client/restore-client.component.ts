import { Component, OnInit } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { DOCUMENT_PREFIXES } from '../../libs/base/DocumentPrefixes';
import { ClientStatus } from '../../libs/enums/User';
import { toJson } from '../../libs/interfaces/Socket';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { DialogMessages } from '../../libs/enums/UserMessages';

@Component({
  selector: 'app-restore-client',
  templateUrl: './restore-client.component.html',
  styleUrls: ['./restore-client.component.scss']
})
export class RestoreClientComponent implements OnInit {

  private _clientReincorporationForm: FormGroup;

  constructor(private _userService: UserService
    ,public loadingService: LoadingService
    ,public notificationService: NotificationService) {
    this._clientReincorporationForm = new FormGroup({
      document_content: new FormControl("",[
        (control:AbstractControl)=>{
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {invalidSyntax: true};
        }
      ])
    });
  }

  ngOnInit() {
  }

  async reincorporateClient(client?:toJson.IUser){
    //1. Buscamos el cliente por la cédula.
    //2. Pedimos la desincorporación del cliente.
    //625374
    if(!client){
      this._clientReincorporationForm.controls['document_content'].setValue(
        SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._clientReincorporationForm.controls['document_content'].value)
      );
      let fetchResult = await this._userService.fetchClientByDocument(DOCUMENT_PREFIXES.CI, this._clientReincorporationForm.controls['document_content'].value);
      if(fetchResult.length>0){
        //Cliente encontrado.
        let client:toJson.IUser = fetchResult[0];
        if(client.status == ClientStatus.ACTIVE){        
          this.notificationService.notifyDialog(DialogMessages.RESTORE_CLIENT.ALREADY_RESTORED, <any>{stack:true});
          return;
        }
        let restoreClient = await this.notificationService.confirmDialog(DialogMessages.RESTORE_CLIENT.CONFIRM.replace('${1}', client.firstName), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
        if(restoreClient){
          let result = await this._userService.reincorporateClient(client.id);
          console.log(result);
        }
      }else{
        //Cliente no encontrado...
        this.notificationService.notifyDialog(DialogMessages.RESTORE_CLIENT.NOT_FOUND, <any>{stack:true});        
      }
    }else{
      if(client.status == ClientStatus.ACTIVE){        
        this.notificationService.notifyDialog(DialogMessages.RESTORE_CLIENT.ALREADY_RESTORED, <any>{stack:true});
        return;
      }
      let restoreClient = await this.notificationService.confirmDialog(DialogMessages.RESTORE_CLIENT.CONFIRM.replace('${1}', client.firstName), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
      if(restoreClient){
        let result = await this._userService.reincorporateClient(client.id);
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
