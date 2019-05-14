import { Component, OnInit, NgZone, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { DbService } from '../../libs/services/db/db.service';
import { UserService } from '../../libs/services/user/user.service';
import * as UIKit from 'uikit';
import {EventEmitter} from 'events';
import { USER_SERVICE_EVENTS, LogInResult, LogOutResult, AdminCreationResult, ClientCreationResult, PaymentAddResult, SuperAdminCreationResult, ClientRemoveResult, ClientRestoreResult, ClientUpdateResult, AdminUpdateResult, AdminRemoveResult, AdminRestoreResult, RoleUpdateResult } from '../../libs/enums/User';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { PaymentService } from '../../libs/services/payment/payment.service';
import { PAYMENT_SERVICE_EVENTS } from '../../libs/enums/Payment';
import { Router } from '@angular/router';
import { ExportDataComponent } from '../export-data/export-data.component';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-base-screen',
  templateUrl: './base-screen.component.html',
  styleUrls: ['./base-screen.component.scss']
})
export class BaseScreenComponent implements OnInit, AfterViewInit {
  private _userServiceListener:Subscription;
  private _paymentServiceListener:Subscription;


  @ViewChild("exportDataComponent")
  private exportDataComponent: ExportDataComponent;

  constructor(private dbServiceI: DbService, 
    public userService: UserService, 
    public loadingService: LoadingService,
    private paymentService: PaymentService,
    private ref: ChangeDetectorRef) {      
     this.listenEvents();
  }

  ngAfterViewInit(){
  }
  

  async logOut(){
    this.loadingService.displayBasicLoading();
    await this.userService.logOut();
    this.loadingService.hideBasicLoading();
  }

  listenEvents(){
    this._userServiceListener = this.userService.subject.subscribe((payload:{event:USER_SERVICE_EVENTS, data:any})=>{
      try{
        this.ref.detectChanges()
      }catch(e){

      }
    });
    this._paymentServiceListener = this.paymentService.subject.subscribe((payload:{event:PAYMENT_SERVICE_EVENTS, data:any})=>{
      try{
        this.ref.detectChanges()
      }catch(e){

      }
    })
  }

  desincorporatClient(){
    AppComponent.mainNavBar.desincorporateClient();
  }

  reincorporateClient(){
    AppComponent.mainNavBar.reincorporateClient();
  }

  ngOnInit() {
    //UIkit.modal('#superAdminCreationModal').show();
    //this.loadingService.displayBasicLoading();    
  }

  logIn(){
    AppComponent.mainNavBar.logIn();
  }

  createAdmin(){
    AppComponent.mainNavBar.createAdmin();
  }

  incorporateUser(){
    AppComponent.mainNavBar.incorporateUser();
  }

  updateClient(){
    AppComponent.mainNavBar.updateClient();
  }

  updateAdmin(){
    AppComponent.mainNavBar.updateAdmin();
  }

  removeAdmin(){
    AppComponent.mainNavBar.removeAdmin();
  }

  restoreAdmin(){
    AppComponent.mainNavBar.restoreAdmin();
  }

  addPayment(){
    AppComponent.mainNavBar.addPayment();
  }

  consultUser(){
    AppComponent.mainNavBar.consultUser();
  }

  searchClients(){
    AppComponent.mainNavBar.searchClients();
  }

  backupData(){
    this.exportDataComponent.generateExport();
  }

}
