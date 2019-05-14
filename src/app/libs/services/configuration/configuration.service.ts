import { Injectable } from '@angular/core';
import { Configuration } from '../../models/Configuration'
import { DATABASE_MODEL_EVENTS, DATABASE_SERVICE_EVENTS } from '../../enums/Database';
import { Subscription, Subject } from 'rxjs';
import { DbService } from '../db/db.service';
import { DatabaseService } from '../../providers/DatabaseProvider';
import {SYSTEM_SERVICE_EVENTS, CONFIGURATION_SERVICE_EVENTS } from '../../enums/Services';
import * as defaultConfig from '../../../../assets/config.json';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  public configuration:Configuration;
  private _confChangesListener:Subscription;
  public subject: Subject<SYSTEM_SERVICE_EVENTS> = new Subject<SYSTEM_SERVICE_EVENTS>();
  public configurationNotifier: Subject<CONFIGURATION_SERVICE_EVENTS> = new Subject<CONFIGURATION_SERVICE_EVENTS>();

  constructor(
    public databaseService: DbService
  ) { }



  private _listenConfchanges(): Subscription {
    return this._confChangesListener ? this._confChangesListener : (()=>{
      this._confChangesListener = this.configuration.subject.subscribe((event)=>{
        if(event === DATABASE_MODEL_EVENTS.MODEL_UPDATED){
          this._reloadConfiguration();
        }
      })
      return this._confChangesListener;
    })();
  }

  async _reloadConfiguration(){
    if(!this.databaseService.initialized){
      await new Promise((accept,reject)=>{
        this.databaseService.subject.subscribe((event:DATABASE_SERVICE_EVENTS)=>{
          if(event === DATABASE_SERVICE_EVENTS.SERVICE_LOADED){
            accept();
          }else{
            reject();
          }
        })
      });      
    }
    this.configuration = await DatabaseService.Instance.connection
    .getRepository(Configuration).findOne();
    this.configurationNotifier.next(CONFIGURATION_SERVICE_EVENTS.CONFIGURATION_LOADED);
  }

  public async getConfiguration():Promise<Configuration>{
    return this.configuration ? this.configuration : 
    (async ()=>{
      await this._reloadConfiguration();
      if(!this.configuration){
        this.configuration = new Configuration();
        this.configuration.socketHost = defaultConfig['server']['host'];
        this.configuration.socketPort = parseInt(defaultConfig['server']['port']);
        this.configuration.createdAt = new Date();
        this.configuration.updatedAt = new Date();
        this.configuration = await this.saveConfiguration(this.configuration);
      }
      this._listenConfchanges();
      this.subject.next(SYSTEM_SERVICE_EVENTS.CONFIGURATION_LOADED);
      return this.configuration;
    })()
  }

  public async saveConfiguration(config:Configuration):Promise<Configuration>{
      return await DatabaseService.Instance.connection.getRepository(Configuration).save(config);
  }
}
