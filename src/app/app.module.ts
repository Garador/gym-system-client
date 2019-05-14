import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Error404Component } from './error404/error404.component';
import {APP_BASE_HREF} from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { BaseScreenComponent } from './components/base-screen/base-screen.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateSuperadminComponent } from './components/create-superadmin/create-superadmin.component';
import { UpdateSuperAdminComponent } from './components/update-super-admin/update-super-admin.component';
import { CreateAdminComponent } from './components/create-admin/create-admin.component';
import { UpdateAdminComponent } from './components/update-admin/update-admin.component';
import { RemoveAdminComponent } from './components/remove-admin/remove-admin.component';
import { IncorporateClientComponent } from './components/incorporate-client/incorporate-client.component';
import { DesincorporateClientComponent } from './components/desincorporate-client/desincorporate-client.component';
import { UpdateClientComponent } from './components/update-client/update-client.component';
import { RestoreClientComponent } from './components/restore-client/restore-client.component';
import { RestoreAdminComponent } from './components/restore-admin/restore-admin.component';
import { CreatePaymentComponent } from './components/create-payment/create-payment.component';
import { ConsultClientComponent } from './components/consult-client/consult-client.component';
import { SearchClientComponent } from './components/search-client/search-client.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchAdminComponent } from './components/search-admin/search-admin.component';
import { ClientDetailsComponent } from './components/client-details/client-details.component';
import { AdminDetailsComponent } from './components/admin-details/admin-details.component';
import { SearchPaymentComponent } from './components/search-payment/search-payment.component';
import { SearchLogsComponent } from './components/search-logs/search-logs.component';
import { SearchPagingComponent } from './components/search-paging/search-paging.component';
import { LoadUserComponent } from './components/load-user/load-user.component';
import { LogContentDetailsComponent } from './components/log-content-details/log-content-details.component';
import { ExportDataComponent } from './components/export-data/export-data.component';
import { ImportDataComponent } from './components/import-data/import-data.component';
import { ExportImportDataComponent } from './components/export-import-data/export-import-data.component';
import { DocumentFormatPipePipe } from './pipes/document-format-pipe.pipe';
import { CustomCurrencyPipe } from './pipes/currency/custom-currency.pipe';
import { PaymentDetailComponent } from './components/payment-detail/payment-detail.component';
import { ConfComponent } from './components/conf/conf.component';
import { JqueryUpdatePipe } from './pipes/date/jquery-update.pipe';



@NgModule({
  declarations: [
    AppComponent,
    Error404Component,
    LoginComponent,
    BaseScreenComponent,
    CreateSuperadminComponent,
    UpdateSuperAdminComponent,
    CreateAdminComponent,
    UpdateAdminComponent,
    RemoveAdminComponent,
    IncorporateClientComponent,
    DesincorporateClientComponent,
    UpdateClientComponent,
    RestoreClientComponent,
    RestoreAdminComponent,
    CreatePaymentComponent,
    ConsultClientComponent,
    SearchClientComponent,
    NavbarComponent,
    SearchAdminComponent,
    ClientDetailsComponent,
    AdminDetailsComponent,
    SearchPaymentComponent,
    SearchLogsComponent,
    SearchPagingComponent,
    LoadUserComponent,
    LogContentDetailsComponent,
    ExportDataComponent,
    ImportDataComponent,
    ExportImportDataComponent,
    DocumentFormatPipePipe,
    CustomCurrencyPipe,
    PaymentDetailComponent,
    ConfComponent,
    JqueryUpdatePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [{provide: APP_BASE_HREF, useValue : '' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
