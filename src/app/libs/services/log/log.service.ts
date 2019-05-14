import { Injectable } from '@angular/core';
import { ILogSearchOptions } from '../../interfaces/Log';
import { toJson, IRequests } from '../../interfaces/Socket';
import { UserService } from '../user/user.service';
import { LogResultMode } from '../../enums/Log';
import { SocketService } from '../socket/socket.service';
import { SOCKET_CALL_ROUTES, SOCKET_REQUEST_ERROR } from '../../enums/Socket';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(
    private userService: UserService,
    private socketService: SocketService
  ) { }

  public async searchLogs(searchOptions:ILogSearchOptions): Promise <toJson.ILog[]>{
    let logSearchResult:toJson.ILog[] = [];
    let logSearchResponse:IRequests.Logs.GetResponse;
    //SOCKET_CALL_ROUTES.CLIENT_PAYMENT_SEARCH
    let paymentRequestPayload:IRequests.Logs.Get = {
      _meta:{
          _id: Math.floor(Math.random()*99999),
          _auth:{
              jwt:this.userService.personalProfile.jwt.token
          }
        },
        payload: {
          searchOptions:searchOptions
          ,resultMode: LogResultMode.ENTITIES
        }
    };
    
    try{
      logSearchResponse = await this.socketService.call(SOCKET_CALL_ROUTES.LOG_SEARCH, <any>paymentRequestPayload);
      if(SOCKET_REQUEST_ERROR[<SOCKET_REQUEST_ERROR>logSearchResponse.payload] === undefined){
        logSearchResult = <toJson.ILog[]>(<IRequests.Logs.GetResponse>logSearchResponse).payload
      }
    }catch(e){
      console.log("Request error: ",e);
    };
    return logSearchResult;
  }
}
