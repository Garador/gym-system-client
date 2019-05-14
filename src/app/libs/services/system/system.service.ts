import { Injectable } from '@angular/core';
import { DatabaseService } from '../../providers/DatabaseProvider';
import { DbService } from '../db/db.service';
import { CurrencyService } from '../currency/currency.service';
import {SYSTEM_SERVICE_EVENTS } from '../../enums/Services';
import { Subscription, Subject } from 'rxjs';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class SystemService { 
  public subject: Subject<SYSTEM_SERVICE_EVENTS> = new Subject<SYSTEM_SERVICE_EVENTS>();

  constructor(
    public currencyService:CurrencyService,
    public databaseService: DbService,
    public configuration:ConfigurationService
  ) {

  }


  public async restoreLocalStatus(){
    //1. Cleans database.
    //2. Reload base tables.
    await DatabaseService.Instance.connection.dropDatabase();
    await DatabaseService.Instance.auditConnection.dropDatabase();
    DatabaseService.Instance.connection.close();
    DatabaseService.Instance.auditConnection.close();
    await DatabaseService.Instance.initialize();
    await this.currencyService.loadCurrencies();
    return;
  }

  public listenConfigurationChangesEvents(){
    this.configuration.subject.subscribe((ev:SYSTEM_SERVICE_EVENTS)=>{
      this.subject.next(ev);
    })
  }

}
