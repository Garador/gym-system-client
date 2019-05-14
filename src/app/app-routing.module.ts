import { NgModule, Injectable, NgZone } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {BaseScreenComponent} from './components/base-screen/base-screen.component';
import {SearchClientComponent} from './components/search-client/search-client.component';
import { SearchAdminComponent } from './components/search-admin/search-admin.component';
import { SearchPaymentComponent } from './components/search-payment/search-payment.component';
import { SearchLogsComponent } from './components/search-logs/search-logs.component';
import { ExportImportDataComponent } from './components/export-import-data/export-import-data.component';
import { CanActivate } from '@angular/router';
import { UserService } from './libs/services/user/user.service';
import { USER_SERVICE_EVENTS } from './libs/enums/User';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  public static userListener:Subscription;
  
  constructor(
    public userService: UserService,
    private router:Router,
    private ngZone:NgZone){
      LoggedInGuard.userListener = (LoggedInGuard.userListener) ? LoggedInGuard.userListener : this.userService.subject.subscribe((payload:{event:USER_SERVICE_EVENTS, data:any})=>{
        switch(payload.event){
          case USER_SERVICE_EVENTS.LOGOUT:
          this.ngZone.run(()=>{
            this.router.navigate(['/']);
          })
          break;
        }
      });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      let isLoggedIn = this.userService.loggedIn;
      if(!isLoggedIn){
        this.ngZone.run(()=>{
          this.router.navigate(['/']);
        })
      }
      return isLoggedIn;
  }
}

const routes: Routes = [
  {
    path:'searchClients',
    component:SearchClientComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path:'searchAdmins', 
    component:SearchAdminComponent,
    canActivate: [LoggedInGuard]
  },{
    path:'searchPayments', 
    component:SearchPaymentComponent,
    canActivate: [LoggedInGuard]
  },{
    path:'export-import', 
    component:ExportImportDataComponent,
    canActivate: [LoggedInGuard]
  },{
    path:'searchLogs', component:SearchLogsComponent,
    canActivate: [LoggedInGuard]
  },
  {    
    path: '**', component: BaseScreenComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
