import { Component, OnInit, ChangeDetectorRef, ViewChild, NgZone, Injector } from '@angular/core';
import { UserService } from '../../libs/services/user/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { USER_SERVICE_EVENTS, LogOutResult, AdminCreationResult, ClientCreationResult, ClientRestoreResult, ClientUpdateResult, SuperAdminCreationResult, ClientRemoveResult, AdminRestoreResult, RoleUpdateResult, AdminRemoveResult, PaymentAddResult, LogInResult, AdminUpdateResult } from '../../libs/enums/User';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { PAYMENT_SERVICE_EVENTS } from '../../libs/enums/Payment';
import { DbService } from '../../libs/services/db/db.service';
import { toJson } from '../../libs/interfaces/Socket';
import { UpdateClientComponent } from '../update-client/update-client.component';
import { DesincorporateClientComponent } from '../desincorporate-client/desincorporate-client.component';
import { RestoreClientComponent } from '../restore-client/restore-client.component';
import { ClientDetailsComponent } from '../client-details/client-details.component';
import { UpdateAdminComponent } from '../update-admin/update-admin.component';
import { RestoreAdminComponent } from '../restore-admin/restore-admin.component';
import { RemoveAdminComponent } from '../remove-admin/remove-admin.component';
import { AdminDetailsComponent } from '../admin-details/admin-details.component';
import { BackupService } from '../../libs/services/backup/backup.service';
import { SystemService } from '../../libs/services/system/system.service';
import { BACKUP_SERVICE_EVENTS } from '../../libs/enums/ExportManager';
import { CreatePaymentComponent } from '../create-payment/create-payment.component';
import { DialogMessages } from '../../libs/enums/UserMessages';
import { IncorporateClientComponent } from '../incorporate-client/incorporate-client.component';
import { UIKitHelper } from '../../libs/helpers/UIKitHelper';
import { CreateAdminComponent } from '../create-admin/create-admin.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @ViewChild("updateClientComponent")
  private updateClientComponent:UpdateClientComponent;

  @ViewChild("desincorporateClientComponent")
  private desincorporateClientComponent:DesincorporateClientComponent;

  @ViewChild("reincorporateClientComponent")
  private reincorporateClientComponent:RestoreClientComponent;

  @ViewChild("clientDetailsComponent")
  private clientDetailsComponent:ClientDetailsComponent;

  @ViewChild("updateAdminComponent")
  private updateAdminComponent:UpdateAdminComponent;

  @ViewChild("createAdminComponent")
  private createAdminComponent:CreateAdminComponent;

  @ViewChild("restoreAdminComponent")
  private restoreAdminComponent:RestoreAdminComponent;

  @ViewChild("incorporateClientComponent")
  private _createClientModal:IncorporateClientComponent;

  @ViewChild("removeAdminComponent")
  private removeAdminComponent:RemoveAdminComponent;

  @ViewChild("adminDetailsComponent")
  private adminDetailsComponent:AdminDetailsComponent;

  @ViewChild("createPaymentComponent")
  private createPaymentComponent: CreatePaymentComponent;


  private _userServiceListener:Subscription;
  private _paymentServiceListener:Subscription;
  private _backupServiceListener:Subscription;
  private _modalListenersInitialized:string[] = [];

  private _loginModal:any;  //UIKit Modal reference to login.

  
  private _modalData = {
    editUser:{
      user:<toJson.IUser>null
    }
  }
  
  constructor(
    private userService: UserService,
    private routerService: Router,
    private dbServiceI: DbService,
    public loadingService: LoadingService,
    private notificationService: NotificationService,
    private paymentService: PaymentService,
    private ref: ChangeDetectorRef,
    private backupService:BackupService,
    private systemService:SystemService,
    private injector: Injector,
    private ngZone: NgZone
  ) {
    new Promise(async (accept)=>{
      await dbServiceI.Initialize();
      await userService.loadPersonalProfile();
      this.listenEvents();
      accept();
    })
    .then(()=>{
      console.log("Loaded it...");
    })
    .catch((e)=>{
      console.log("Error...");
      console.log(e);
    });
  }

  ngOnInit() {
  }

  public get canShowClientsMenu():boolean{
    return (this.userService.canIncorporate || this.userService.canDesincorporate || this.userService.canSearchClients || this.userService.canConsultClients);
  }

  public get canShowPaymentsMenu(): boolean{
    return (this.userService.canAddPayments || this.userService.canSearchPayments);
  }

  public get canShowAdminsMenu(): boolean{
    return (this.userService.canAddAdmin || 
    this.userService.canUpdateAdmin || 
    this.userService.canRemoveAdmin || 
    this.userService.canSearchAdmin || 
    this.userService.canSearchAdmin );
  }

  public get canShowLogs(): boolean{
    return this.canShowAdminsMenu;
  }

  public get canShowExportImportMenu(): boolean {
    return (this.userService.canExportData || this.userService.canImportData);
  }


  //Client
  async desincorporateClient(user?:toJson.IUser){
    if(user){
      await this.desincorporateClientComponent.desincorporateClient(user);
    }else{
      this.showUIKitModal('.desincorporateClientModal');
    }
  }

  reincorporateClient(user?:toJson.IUser){
    if(user){
      this.reincorporateClientComponent.reincorporateClient(user)
    }else{
      this.showUIKitModal('.reincorporateClientModal');
    }
  }

  incorporateUser(){
    UIkit.modal('.clientCreationModal').show();
    this.addModalEventListener(".clientCreationModal");
  }

  updateClient(user?:toJson.IUser){
    if(user){
      this.updateClientComponent.loadUser(user);
    }
    let modal = this.showUIKitModal('.updateClientModal');
    this.updateClientComponent.modalRef = ".updateClientModal";
    this.addModalEventListener(".updateClientModal");
  }

  addModalEventListener(modalElementID:string){
    if(modalElementID === ".updateClientModal"){
      if(this._modalListenersInitialized.indexOf('.updateClientModal')<0){
        //Initialize Modal
        $('.updateClientModal').on({
          'show.uk.modal': function(){
              //Element is visible
          },
          'hide.uk.modal': ()=>{
              //Element is not visible
              this.updateClientComponent.cleanForm();
          }
        });
        this._modalListenersInitialized.push('.updateClientModal');
      }
    }
    if(modalElementID === ".clientCreationModal"){
      if(this._modalListenersInitialized.indexOf('.clientCreationModal')<0){
        $('.clientCreationModal').on({
          'show.uk.modal': ()=>{
              this._createClientModal.setDefaultDates();
          },
          'hide.uk.modal': ()=>{
              this._createClientModal.cleanForm();
          }
        });
        this._modalListenersInitialized.push('.clientCreationModal');
      }
    }
    if(modalElementID === ".adminCreationModal"){
      if(this._modalListenersInitialized.indexOf('.adminCreationModal')<0){
        $('.adminCreationModal').on({
          'show.uk.modal': ()=>{
          },
          'hide.uk.modal': ()=>{
            this.createAdminComponent.resetForm();
          }
        });
        this._modalListenersInitialized.push('.adminCreationModal');
      }
    }
  }

  consultUser(){
    this.showUIKitModal('.consultClientModal');
  }

  searchClients(){
    const routerService:Router = this.injector.get(Router);
    const ngZone:NgZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/searchClients']);
    });
  }

  searchAdmins(){
    const routerService:Router = this.injector.get(Router);
    const ngZone:NgZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/searchAdmins']);
    });
  }

  viewClientDetails(user:toJson.IUser){
    this.clientDetailsComponent.loadUser(user);
    this.showUIKitModal('.clientDetailsmodal');
  }
  //Client

  //Admin
  createAdmin(){
    this.showUIKitModal('.adminCreationModal');
    this.addModalEventListener('.adminCreationModal');
  }

  updateAdmin(user?:toJson.IUser){
    if(user){
      this.updateAdminComponent.loadUser(user);
    }
    this.showUIKitModal('#updateAdminModal');
    this.addModalEventListener('#updateAdminModal');
    this.updateAdminComponent.modalRef = '#updateAdminModal';
  }

  removeAdmin(user?: toJson.IUser){
    if(user){
      this.removeAdminComponent.desincorporateAdmin(user);
    }else{
      this.showUIKitModal('#removeAdminModal');
    }
    
  }

  restoreAdmin(user?: toJson.IUser){
    if(user){
      this.restoreAdminComponent.restoreAdmin(user);
    }else{
      this.showUIKitModal('#restoreAdminModal');
    }
  }

  viewAdminDetails(user:toJson.IUser){
    this.adminDetailsComponent.loadUser(user);
    this.showUIKitModal('#adminDetailsModal');
  }
  //Admin

  //Payment
  addPayment(user?:toJson.IUser){
    if(user){
      this.createPaymentComponent.loadUser(user);
    }
    this.showUIKitModal('.addPaymentModal');
  }

  searchPayment(){
    const routerService:Router = this.injector.get(Router);
    const ngZone:NgZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/searchPayments']);
    });
  }
  //Payment

  goMainScreen(){
    const routerService:Router = this.injector.get(Router);
    const ngZone:NgZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/']);
    });
  }

  viewLogs(){
    const routerService:Router = this.injector.get(Router);
    const ngZone:NgZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/searchLogs']);
    });
  }

  exportImport(){
    const routerService:Router = this.injector.get(Router);
    const ngZone:NgZone = this.injector.get(NgZone);
    ngZone.run(() => {
      routerService.navigate(['/export-import']);
    });
  }

  logIn(){
    this._loginModal = this.showUIKitModal('.loginModal');
  }

  configure(){
    this.showUIKitModal('.appConfigurationComponent');
  }

  showUIKitModal(modal:string){
    let modalB:any;
    this.ngZone.run(()=>{
      modalB = UIKitHelper.Instance.showModalRemovingDuplicates(modal);
    });
    this.ref.detectChanges();
    return modalB;
  }

  listenEvents(){
    this._userServiceListener = this.userService.subject.subscribe((payload:{event:USER_SERVICE_EVENTS, data:any})=>{
      switch(payload.event){
        case USER_SERVICE_EVENTS.LOGIN:
          this.notificationService.showLogInNotification(<LogInResult>(<any>payload.data));
          if(this._loginModal){
            this._loginModal.hide();
          }
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.LOGOUT:
          this.notificationService.showLogOutNotification(<LogOutResult>(<any>(payload)).data.code);
          if(<LogOutResult>(<any>(payload)).data.error){
            console.log("Error logging out...\n", <LogOutResult>(<any>(payload)).error);
          }
          this.ngZone.run(()=>{
            this.ref.detectChanges();
          });
        break;
        case USER_SERVICE_EVENTS.PROFILE_LOADED:
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.ADMIN_CREATED:
          this.notificationService.showAdminCreationNotification(<AdminCreationResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.CLIENT_CREATED:
          this.notificationService.showClientCreationResult(<ClientCreationResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.CLIENT_RESTORED:
          this.notificationService.showClientReincorporationResult(<ClientRestoreResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.CLIENT_UPDATED:
          this.notificationService.showClientUpdateResult(<ClientUpdateResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.SUPER_ADMIN_CREATED:
          this.notificationService.showSuperAdminCreationResult(<SuperAdminCreationResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.CLIENT_DESINCORPORATED:
          this.notificationService.showClientDesincorporationResult(<ClientRemoveResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.ADMIN_RESTORED:
          this.notificationService.showAdminRestoreResult(<AdminRestoreResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.ADMIN_UPDATED:
          this.notificationService.showAdminUpdateResult(<AdminUpdateResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.ADMIN_ROLE_UPDATED:
          this.notificationService.showRoleUpdateResuls(<RoleUpdateResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.ADMIN_REMOVED:
          this.notificationService.showAdminRemoveResult(<AdminRemoveResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
        case USER_SERVICE_EVENTS.ADMIN_RESTORED:
          this.notificationService.showAdminRestoreResult(<AdminRestoreResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
      }
    });
    this._paymentServiceListener = this.paymentService.subject.subscribe((payload:{event:PAYMENT_SERVICE_EVENTS, data:any})=>{
      switch(payload.event){
        case PAYMENT_SERVICE_EVENTS.PAYMENT_ADDED:
          this.notificationService.showPaymentAddedNotification(<PaymentAddResult>(<any>(payload)).data.code);
          this.ref.detectChanges();
        break;
      }
    });
    this._backupServiceListener = this.backupService.subject.subscribe(async (payload:{event:BACKUP_SERVICE_EVENTS, data:any})=>{
      switch(payload.event){
        case BACKUP_SERVICE_EVENTS.DATABASE_RESTORED:
          await this.userService.logOut();
          await this.systemService.restoreLocalStatus();
          this.ref.detectChanges();
          //window.location.reload();
          this.notificationService.notifyDialog(DialogMessages.RESTORE_DATA.SUCCESS);
        break;
      }
    })
  }

  public async reloadLocalStatus(){

  }

  async logOut(){
    this.loadingService.displayBasicLoading();
    await this.userService.logOut();
    this.loadingService.hideBasicLoading();
  }
}
