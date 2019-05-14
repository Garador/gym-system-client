import { Injectable } from '@angular/core';
import { DatabaseService } from '../../providers/DatabaseProvider';
import { Connection } from 'typeorm/browser';
import { Subject } from 'rxjs';
import { DATABASE_SERVICE_EVENTS } from '../../enums/Database';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private _initialized:boolean = false;
  private _initializing:boolean = false;
  public subject = new Subject<DATABASE_SERVICE_EVENTS>();

  constructor() { 
    this.Initialize()
    .then((databaseInstance)=>{
      this._initialized = true;
    });
  }

  public async Initialize(){    
    if(!this._initialized && !this._initializing){
      this._initializing = true;
      DatabaseService.Instance.testing = true;
      try{
        await DatabaseService.Instance.initialize();
        this.emitEvent(DATABASE_SERVICE_EVENTS.SERVICE_LOADED);
        this._initialized = true;
        this._initializing = false;
        return true;
      }catch(e){
        console.log("Error initializing database...");
        console.log(e)
        this.emitEvent(DATABASE_SERVICE_EVENTS.SERVICE_LOADING_FAIL);
        this._initializing = false;
        return null;
      }
    }else{
      return true;
    }
  }

  get initialized(){
    return this._initialized;
  }

  public get mainConnection(): Connection{
    return DatabaseService.Instance.connection;
  }

  public get auditConnection(): Connection{
    return DatabaseService.Instance.auditConnection;
  }

  public emitEvent(eventID: DATABASE_SERVICE_EVENTS){
    this.subject.next(eventID);
  }

}
