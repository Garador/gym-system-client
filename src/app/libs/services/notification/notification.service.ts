import { Injectable } from '@angular/core';
import { SuperAdminMessages, AuthMessages, AdminMessages, ClientMessages, PaymentMessages, Role, ConfigurationUpdate } from '../../../libs/enums/UserMessages';
import { SuperAdminUpdateResult, LogInResult, LogOutResult, AdminCreationResult, ClientCreationResult, PaymentAddResult, SuperAdminCreationResult, ClientRemoveResult, ClientRestoreResult, ClientUpdateResult, AdminUpdateResult, AdminRemoveResult, AdminRestoreResult, RoleUpdateResult } from '../../../libs/enums/User';
import { SOCKET_REQUEST_ERROR } from '../../enums/Socket';
import {SocketRequestErrors} from '../../enums/UserMessages';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {

  }

  public showSuperAdminUpdateNotification(result:SuperAdminUpdateResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = SuperAdminMessages[result];
    switch(result){
      case SuperAdminUpdateResult.SUCCESS:
        payload.status = "success";
      break;
      case SuperAdminUpdateResult.INVALID_DATA:
        payload.status = "warning";
      break;
      case SuperAdminUpdateResult.USER_NOT_FOUND:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = "Actualización de super-usuario ejecutada...";
    }
    this.showUIKitNotification(payload);
  }

  public showSocketErrorNotification(result:SOCKET_REQUEST_ERROR){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'warning',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = SocketRequestErrors[result];
    if(!payload.message){
      payload.message = `SocketRequestError: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showLogInNotification(result:LogInResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = AuthMessages.LogIn[result];
    switch(result){
      case LogInResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `LogIn Ejecutado con código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showConfigurationUpdateMessage(result:number){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = ConfigurationUpdate[result];
    switch(result){
      case 1:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    this.showUIKitNotification(payload);
  }

  public showLogOutNotification(result:LogOutResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = AuthMessages.LogOut[result];
    switch(result){
      case LogOutResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `LogOut Ejecutado con código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showAdminCreationNotification(result:AdminCreationResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = AdminMessages.Create[result];
    switch(result){
      case AdminCreationResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      console.log(`result: `,result);
      payload.message = `Admin creado - Ejecutado con código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showAdminUpdateResult(result:AdminUpdateResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = AdminMessages.Update[result];
    switch(result){
      case AdminUpdateResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      console.log(`result: `,result);
      payload.message = `Admin actualizado - Ejecutado con código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showClientDesincorporationResult(result:ClientRemoveResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = ClientMessages.Remove[result];
    switch(result){
      case ClientRemoveResult.SUCCESS:
      case ClientRemoveResult.SUCCESS_LOGICAL:
      case ClientRemoveResult.SUCCESS_PHYSICAL:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Desincorporación del cliente procesada - Resultado código #${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showAdminRestoreResult(result:AdminRestoreResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = AdminMessages.Restore[result];
    switch(result){
      case AdminRestoreResult.SUCCESS:
      case AdminRestoreResult.SUCCESS_LOGICAL:
      case AdminRestoreResult.SUCCESS_PHYSICAL:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Desincorporación del cliente procesada - Resultado código #${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showRoleUpdateResuls(result:RoleUpdateResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = Role.Update[result];
    switch(result){
      case RoleUpdateResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Desincorporación del cliente procesada - Resultado código #${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showAdminRemoveResult(result:AdminRemoveResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = AdminMessages.Remove[result];
    switch(result){
      case AdminRemoveResult.SUCCESS:
      case AdminRemoveResult.SUCCESS_LOGICAL:
      case AdminRemoveResult.SUCCESS_PHYSICAL:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Desincorporación del cliente procesada - Resultado código #${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showClientReincorporationResult(result:ClientRestoreResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = ClientMessages.Restore[result];
    switch(result){
      case ClientRestoreResult.SUCCESS:
      case ClientRestoreResult.SUCCESS_LOGICAL:
      case ClientRestoreResult.SUCCESS_PHYSICAL:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Reincorporación del cliente procesada - Resultado código #${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showClientUpdateResult(result:ClientUpdateResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = ClientMessages.Update[result];
    switch(result){
      case ClientUpdateResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Actualización del cliente procesada - Resultado código #${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showClientCreationResult(result:ClientCreationResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = ClientMessages.Create[result];
    switch(result){
      case ClientCreationResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Creación de cliente procesada - Resultado código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showSuperAdminCreationResult(result:SuperAdminCreationResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    };
    payload.message = SuperAdminMessages.Create[result];
    switch(result){
      case SuperAdminCreationResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      console.log(`result: `,result);
      payload.message = `SuperAdmin creado - Ejecutado con código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showPaymentAddedNotification(result:PaymentAddResult){
    let payload:UIkit.NotifyOptions = {
      message: 'my-message!',
      status: 'primary',
      pos: 'top-left',
      timeout: 5000
    };
    payload.message = PaymentMessages.Create[result];
    switch(result){
      case PaymentAddResult.SUCCESS:
        payload.status = "success";
      break;
      default:
        payload.status = "warning";
      break;
    }
    if(!payload.message){
      payload.message = `Pago Procesado - Resultado código: ${result}`;
    }
    this.showUIKitNotification(payload);
  }

  public showUIKitNotification(notfPayload:any){
    (<any>UIkit).notification(notfPayload);
  }


  /**
   * @param text Texto a mostrar en el diálogo de confirmación.
   * @param options Opciones a mostrar en el diálogo.
   * @example
   * let restoreClient = await this.notificationService.confirmDialog(`¿Desea restaurar al cliente con nombre: ${client.firstName}?`, <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
   */
  public async confirmDialog(text:string, options:UIkit.ModalOptions): Promise<boolean>{
    let result = await new Promise<boolean>((accept)=>{
      (<any>UIkit.modal.confirm(`<div id="confirmDialogA">${text}</div>`,options))
      .then(()=> {
        accept(true);
      }, () => {
        accept(false);
      });
    });
    return result;
  }

  /**
   * @param text Texto a mostrar en el diálogo de notificación.
   * @param options Opciones a mostrar en el diálogo.
   * @example
   * this.notificationService.notifyDialog(`<p class="uk-modal-body">El usuario ya ha sido restaurado.</p>`, <any>{stack:true});
   * return;
   */
  public async notifyDialog(content:string, options?:UIkit.ModalOptions){
    console.log("Showing notifyDialog");
    let dialog = (<any>UIkit.modal).dialog( `${content}`, options ? options : {stack:true})
    setTimeout(()=>{
      //console.log(dialog);
      if(dialog.isToggled()){
        this.closeConfirmModal();
      }
    },3000)
    return;
  }

  public async alert(content:string, options?:any){
    (<any>UIkit.modal).alert(content);
  }

  closeConfirmModal(){
    let modal = $('.uk-modal').filter(function () {
      return $(this).css("display") === 'block'
    });
    let modalA = modal[modal.length-1];
    console.log("Dialog: ",modalA);
    ///*
    if(modalA){
      (<any>UIkit.modal(
        $(modalA)
      )).hide();
    }
    //*/
  }

}
