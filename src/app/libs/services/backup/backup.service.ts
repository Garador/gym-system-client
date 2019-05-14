import { Injectable } from '@angular/core';
import { IRequests } from '../../interfaces/Socket';
import { UserService } from '../user/user.service';
import { SocketService } from '../socket/socket.service';
import { SOCKET_CALL_ROUTES } from '../../enums/Socket';
import { IExportResult, IFileUploadResult } from '../../interfaces/ExportManager';
import { Subject } from 'rxjs';
import { BACKUP_SERVICE_EVENTS as EVENTS, ImportResultCode } from '../../enums/ExportManager';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  public subject = new Subject<any>();

  constructor(
    public userService: UserService,
    public socketService: SocketService
  ) { }

  public async getFileList(){
    let fileListResponse:IRequests.Data.ExportListResponse;
    if(!this.userService.personalProfile || !this.userService.personalProfile.jwt){
      return [];
    }

    let exportListRequestPayload:IRequests.Data.ExportList = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.userService.personalProfile.jwt.token
            }
      }
    };
    try{
      fileListResponse = await this.socketService.call(SOCKET_CALL_ROUTES.DATA_EXPORT_LIST_REQUEST, <IRequests._BASE_REQUEST_PAYLOAD>exportListRequestPayload);  
    }catch(e){
      console.log("Error getting dump list...",e);
    };
    return (fileListResponse.payload instanceof Array) ? fileListResponse.payload : (()=>{
      console.log(`Error calling:  ${fileListResponse.payload}`);
      return [];
    })();
  }

  public getFileName(fullPath:string):string{
    return fullPath.split(/[\/|\\]/).splice(-1)[0];
  }

  public async generateExport(){
    let fileGenerationResponse:IRequests.Data.ExportResponse;

    let exportGeneratePayload:IRequests.Data.Export = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.userService.personalProfile.jwt.token
            }
        }
    };

    try{
      fileGenerationResponse = await this.socketService.call(SOCKET_CALL_ROUTES.DATA_EXPORT, <IRequests._BASE_REQUEST_PAYLOAD>exportGeneratePayload);
    }catch(e){
      console.log("Error generating dump...",e);
    };
    console.log(`fileGenerationResponse: `,fileGenerationResponse);
    if(fileGenerationResponse.payload instanceof Object){
        return (<IExportResult>fileGenerationResponse.payload).outputFileLocation;
    }else{
      return null;
    }
  }

  public async removeFile(fileName:string){
    let fileRemoveResponse:IRequests.Data.ExportRemove;
    let removeDumptRequestPayload:IRequests.Data.ExportRemove = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.userService.personalProfile.jwt.token
            }
        },
        payload:{
          fileName: fileName
        }
    };

    try{
      fileRemoveResponse = await this.socketService.call(SOCKET_CALL_ROUTES.DATA_EXPORT_REMOVE_REQUEST, <IRequests._BASE_REQUEST_PAYLOAD>removeDumptRequestPayload);
    }catch(e){
      console.log("Error getting dump list...",e);
    };
    console.log(`fileGenerationResponse: `);
    return (typeof(fileRemoveResponse.payload) === "boolean") ? fileRemoveResponse.payload : (()=>{
      console.log(`Error calling:  ${fileRemoveResponse.payload}`);
      return false;
    })();
  }

  public async importFile(file:File):Promise<IFileUploadResult>{

    if(!this.userService.personalProfile || !this.userService.personalProfile.jwt){
      return;
    }
    let responsePayload:IRequests.Data.ImportFileUploadResponse;
    let requestPayload:IRequests.Data.ImportFileUpload = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.userService.personalProfile.jwt.token
            }
        },
        payload:{
          files:[file]
          ,fileNames:[file.name]
        }
    };

    try{
      responsePayload = await this.socketService.call(SOCKET_CALL_ROUTES.DATA_IMPORT_FILE_UPLOAD, <IRequests._BASE_REQUEST_PAYLOAD>requestPayload);
    }catch(e){
      console.log("Error...",e);
    };
    let response:IFileUploadResult;
    if(responsePayload.payload instanceof Object){
      if((<IFileUploadResult>responsePayload.payload).importResult.result === ImportResultCode.SUCCESS){
        this.emitEvent(EVENTS.DATABASE_RESTORED, null);
      }
      response = <IFileUploadResult>responsePayload.payload;
    }
    return response;
  }

  public emitEvent(eventID: EVENTS, eventData: any){
    this.subject.next({event:eventID, data:eventData});
  }

}
