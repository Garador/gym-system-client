import { Injectable } from '@angular/core';
import { DbService } from '../db/db.service';
import { DATABASE_SERVICE_EVENTS } from '../../enums/Database';
import { Currency } from '../../models/Currency';
import { IRequests } from '../../interfaces/Socket';
import { SocketService } from '../socket/socket.service';
import { UserService } from '../user/user.service';
import { SOCKET_CALL_ROUTES } from '../../enums/Socket';
import { USER_SERVICE_EVENTS } from '../../enums/User';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  public currencies:Currency[];
  public dbListener:Subscription;

  constructor(
  public databaseService: DbService, 
  private _socket:SocketService,
  private userService: UserService) {
    console.log("currency.service.ts currencies: ",this.currencies);
    this.loadCurrencies()
    .then(()=>{
      console.log("currency.service.ts currencies: ",this.currencies);
    })
    .catch((e)=>{
      console.log("currency.service.ts currencies: ",this.currencies);
      console.log("Error loading currency...");
      console.log(e);
    });
  }

  public async loadCurrencies(){
    if(!this.databaseService.initialized){
      let currencies = await new Promise<Currency[]>((accept)=>{
        this.dbListener = this.databaseService.subject.subscribe({next:async (code:DATABASE_SERVICE_EVENTS)=>{
          switch(code){
            case DATABASE_SERVICE_EVENTS.SERVICE_LOADED:
              this.databaseService.mainConnection.getRepository(Currency).find()
              .then(async (currencies:Currency[])=>{
                if(currencies.length<1){
                  this.loadFromServer()
                  .then((data)=>{
                    this.currencies = data;
                  })
                  .catch((err)=>{
                    this.currencies = [];
                  });
                }else{
                  this.currencies = currencies;
                  accept(currencies);
                }
              })
              .catch((err)=>{
                accept([]);
              });
          }
        }});
      });
      return currencies;
    }else{
      if(!this.databaseService.mainConnection || this.databaseService.mainConnection.isConnected){
        let interval = setInterval(async ()=>{
          if(this.databaseService.mainConnection && this.databaseService.mainConnection.isConnected){
            this.currencies = await this.databaseService.mainConnection.getRepository(Currency).find();
            if(this.currencies.length<1){
              await this.loadFromServer();
            }
            clearInterval(interval);
          }
        },500);
      }
    }
  }

  async loadFromServer(): Promise<Currency[]>{
    //Load currencies and store them inside the database.
    if(!this.userService.personalProfile || !this.userService.personalProfile.jwt){
      await this.userService.loadPersonalProfile();
    }
    if(!this.userService.personalProfile){
      return;
    }
    let currencyGetRequest:IRequests.Currency.Get = {
      _meta:{
          _id: Math.floor(Math.random()*999999),
          _auth:{
              jwt:this.userService.personalProfile.jwt.token
          }
      }
    }
    let currencyFetchResponse:IRequests.Currency.GetResponse;
    try{
      currencyFetchResponse = await this._socket.call(SOCKET_CALL_ROUTES.CURRENCY_GET, <IRequests._BASE_REQUEST_PAYLOAD>currencyGetRequest);
    }catch(e){
    };
    if((currencyFetchResponse.payload instanceof Array) && currencyFetchResponse.payload.length>0){
      for(let i=0;i<currencyFetchResponse.payload.length; i++){
        let newCurrency = new Currency();
        newCurrency.fromJson(currencyFetchResponse.payload[i]);
        await this.databaseService.mainConnection.getRepository(Currency).save(newCurrency);
      }
    }
    this.currencies = await this.databaseService.mainConnection.getRepository(Currency).find();
    return this.currencies;
  }










}
