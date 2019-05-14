import {
  Component,
  OnInit
} from '@angular/core';
import {
  UserService
} from '../../libs/services/user/user.service';
import {
  FormGroup,
  FormControl,
  AbstractControl
} from '@angular/forms';
import {
  LoadingService
} from '../../libs/services/loading/loading.service';
import {
  SyntaxValidationProvider
} from '../../libs/providers/SyntaxValidationProvider';
import {
  DOCUMENT_PREFIXES
} from '../../libs/base/DocumentPrefixes';
import {
  toJson
} from '../../libs/interfaces/Socket';
import {
  ClientStatus
} from '../../libs/enums/User';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { DialogMessages } from '../../libs/enums/UserMessages';

@Component({
  selector: 'app-desincorporate-client',
  templateUrl: './desincorporate-client.component.html',
  styleUrls: ['./desincorporate-client.component.scss']
})
export class DesincorporateClientComponent implements OnInit {

  private _desincorporateForm: FormGroup;

  constructor(
    private _userService: UserService, 
    private notificationService: NotificationService,
    public loadingService: LoadingService) {
    this._desincorporateForm = new FormGroup({
      document_content: new FormControl("", [
        (control: AbstractControl) => {
          return (SyntaxValidationProvider.validateDocumentContent['CI'](control.value)) ? null : {
            invalidSyntax: true
          };
        }
      ])
    });
  }

  ngOnInit() {}

  async desincorporateClient(client?: toJson.IUser) {
    //1. Buscamos el cliente por la cédula.
    //2. Pedimos la desincorporación del cliente.
    //625374
    if (!client) {
      this._desincorporateForm.controls['document_content'].setValue(
        SyntaxValidationProvider.normalizeDocumentContentFunctions[DOCUMENT_PREFIXES.CI](this._desincorporateForm.controls['document_content'].value)
      );
      let fetchResult = await this._userService.fetchClientByDocument(DOCUMENT_PREFIXES.CI, this._desincorporateForm.controls['document_content'].value);
      if (fetchResult.length > 0) {
        //Cliente encontrado.
        let client: toJson.IUser = fetchResult[0];
        if (client.status == ClientStatus.DELETED) {
          this.notificationService.notifyDialog(DialogMessages.DESINCORPORATE_CLIENT.ALREADY_DESINCORPORATED, <any>{ stack: true });
          return;
        }
        let confirmation = await this.notificationService.confirmDialog(DialogMessages.DESINCORPORATE_CLIENT.CONFIRM.replace('${1}', client.firstName), < any > {
          stack: true,
          labels: {
            "ok": "Si",
            "cancel": "No"
          }
        });
        if(confirmation){
          //this.loadingService.displayBasicLoading(true);
          //await this._userService.desincorporateClient(client.id)
          //this.loadingService.hideBasicLoading();
          this.cancel();
          setTimeout(async ()=>{
            this.loadingService.displayBasicLoading(true);
            let result = await this._userService.desincorporateClient(client.id)
            this.loadingService.hideBasicLoading();
          }, 600);
        }
      } else {
        //Cliente no encontrado...
        this.notificationService.notifyDialog(DialogMessages.DESINCORPORATE_CLIENT.NOT_FOUND, <any>{ stack: true });        
      }
    }else{
      if (client.status == ClientStatus.DELETED) {
        this.notificationService.notifyDialog(DialogMessages.DESINCORPORATE_CLIENT.ALREADY_DESINCORPORATED, <any>{ stack: true });
        return;
      }
      let confirmation = await this.notificationService.confirmDialog(DialogMessages.DESINCORPORATE_CLIENT.CONFIRM.replace('${1}', client.firstName), < any > {
        stack: true,
        labels: {
          "ok": "Si",
          "cancel": "No"
        }
      });
      console.log("Confirmation: ",confirmation);
      if(confirmation){
        this.cancel();
        setTimeout(async ()=>{
          this.loadingService.displayBasicLoading(true);
          let result = await this._userService.desincorporateClient(client.id)
          this.loadingService.hideBasicLoading();
        }, 600);
      }
    }
  }

  cancel() {
    let modal = $('.uk-modal').filter(function () {
      return $(this).css("display") === 'block'
    });
    if(modal){
      for(let i=0;i<modal.length;i++){
        (<any>UIkit.modal(
          $(modal[i])
        )).hide();
      }
    }
  }


}
