import { Injectable } from '@angular/core';
import * as socket_client from 'socket.io-client';
import { SOCKET_CALL_ROUTES } from '../../enums/Socket';
import { IRequests } from '../../interfaces/Socket';
import { NotificationService } from '../notification/notification.service';
import * as config from '../../../../assets/config.json';
import { ConfigurationService } from '../configuration/configuration.service';
import { CONFIGURATION_SERVICE_EVENTS } from '../../enums/Services';
const defaultSocketConf:string = `${config['server']['host']}:${config['server']['port']}`;

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private _client:SocketIOClient.Socket;

  constructor(
    public notificationService: NotificationService,
    public configurationService: ConfigurationService
  ) {

    //this.loadCustomConfClient();
    this.listenConfigChanges();    
  }

  listenConfigChanges(){
    this.configurationService.configurationNotifier
    .subscribe((event:CONFIGURATION_SERVICE_EVENTS)=>{
      if(event === CONFIGURATION_SERVICE_EVENTS.CONFIGURATION_LOADED){
        this.loadCustomConfClient();
      }
    })
  }

  async loadCustomConfClient(){
    try{
      let config = await this.configurationService.getConfiguration();
      if(config){
        let userConfig = `${config.socketHost}:${config.socketPort}`;
        let newConfig = await socket_client(userConfig).connect();
        await new Promise((accept)=>{
          newConfig.on("connect", function(){
            accept();
          })
        });
        if(newConfig.connected){
          if(this._client){
            this._client.close();
          }
          this._client = newConfig;
          console.log("Cargado servicio socket...");
        }else{
          console.log("Nueva configuración no aceptada...",newConfig);
        }
      }
    }catch(e){
      console.log(`Could not load default config.`,e);
    }
  }

  async getClient(): Promise<SocketIOClient.Socket> {
    this._client = (this._client) ? this._client : await socket_client(defaultSocketConf).connect();
    /*
    if(!this._client.connected){
      await new Promise((accept)=>{
        this._client.on('connect', ()=>{
          accept();
        })
      });
    }
    */
    return this._client;
  }

  public async call(route:SOCKET_CALL_ROUTES, payload:IRequests._BASE_REQUEST_PAYLOAD): Promise<IRequests._BASE_REQUEST_PAYLOAD>{
    await this.getClient();
    const response = await new Promise<IRequests._BASE_REQUEST_PAYLOAD>((accept)=>{      
      this._client.emit(route, payload);
      let listener = this._client.once(route, (resultPayload:IRequests._BASE_REQUEST_PAYLOAD)=>{
        if(resultPayload._meta._id === payload._meta._id){
          listener.off(route);
          accept(resultPayload);
        };
      });
    });
    return response;
  }
}
