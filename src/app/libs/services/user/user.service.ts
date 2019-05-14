import { Injectable } from '@angular/core';
import { IRequests } from '../../interfaces/Socket';
import { User } from '../../models/User';
import { SOCKET_CALL_ROUTES, SOCKET_REQUEST_ERROR } from '../../enums/Socket';
import { SocketService } from '../socket/socket.service';
import { ISuperAdminCreationPayload, IBasicProfile, ISuperAdminUpdatePayload, IAdminCreationPayload, IAdminCreationResult, IClientCreationPayload, IClientCreationResult, IUserSearchOptions, ISuperAdminCreationResult, IClientRemoveResult, IClientRestoreResult, IClientUpdateResult, IAdminUpdatePayload, IAdminUpdateResult, IAdminRemoveResult, IRoleUpdatePayload, IRoleUpdateResult } from '../../interfaces/User';
import { toJson } from '../../interfaces/Socket';
import { LogInResult, UserSearchResultMode, USER_SERVICE_EVENTS, LogOutResult, AdminCreationResult, SuperAdminCreationResult, AdminUpdateResult } from '../../enums/User';
import { DbService } from '../db/db.service';
import { Jwt } from '../../models/Jwt';
import { TableNames } from '../../enums/Database';
import { Role } from '../../models/Role';
import { Subject } from 'rxjs';
import { DOCUMENT_PREFIXES } from '../../base/DocumentPrefixes';

export interface ILoginData {
  username:string,
  password:string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _BasicProfile: IBasicProfile;
  public subject = new Subject<any>();
  public loggedIn:boolean = false;

  constructor(private _socket:SocketService, public databaseService: DbService) {
    if(!this.databaseService.initialized){
      let interval = setInterval(async ()=>{
        if(this.databaseService.initialized){
          clearInterval(interval);        
          await this.loadPersonalProfile()
        }
      },200);
    }else{
      this.loadPersonalProfile();
    }
  }

  public async logIn(username:string, password:string):Promise<LogInResult | string>{
    //Hace un intento de log-in con el servidor
    //Carga el usuario
    let basicProfile:IBasicProfile = <any>{};
    let loginResponse:IRequests.Auth.LogInResponse;
    let loginRequestPayload:IRequests.Auth.LogIn = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:null,
                login:{
                    username: username,
                    password: password,//superAdminData.password
                }
            }
        }
    };
    try{
      loginResponse = await this._socket.call(SOCKET_CALL_ROUTES.AUTH_LOGIN, <IRequests._BASE_REQUEST_PAYLOAD>loginRequestPayload);  
    }catch(e){
      console.log(`Error calling to socket...`,e);
      return e;
    };

    if(loginResponse.payload.logIn){
      let profileData = await this.fetchPersonalProfile(loginResponse.payload.data.token);
      console.log(profileData);

      if((<IRequests.UserSearchSuccessfullResponse>profileData).content instanceof Array){
        let userJson:toJson.IUser = (<toJson.IUser>(<IRequests.UserSearchSuccessfullResponse>profileData).content[0]);
        try{          
          let user:User = new User();
          user.fromJson(userJson);
          user.loggedIn = true;
          let currentUser = await this.databaseService.mainConnection.getRepository(User).findOne({
            loggedIn: true
          });
          if(currentUser){
            currentUser.loggedIn = false;
            await this.databaseService.mainConnection.getRepository(User).save(currentUser);
          }
          let userRepo = this.databaseService.mainConnection.getRepository(User);
          user = await this.databaseService.mainConnection.getRepository(User).save(user);
          basicProfile.user = user;
        }catch(e){
          console.log(`Error actualizando el registro del usuario: `,e);
        }

        try{
          //Almacenar el token.
          //1. Eliminamos tokens actuales.
          await this.databaseService.mainConnection.getRepository(Jwt).query(`DELETE FROM "${TableNames.Jwt.table_name}"`);
          //2. Actualizamos el token actual.
          let newToken:Jwt = new Jwt();
          newToken.createdAt = loginResponse.payload.data.jwt.createdAt;
          newToken.updatedAt = loginResponse.payload.data.jwt.updatedAt;
          newToken.status = loginResponse.payload.data.jwt.status;
          newToken.token = loginResponse.payload.data.jwt.token;
          newToken.id = loginResponse.payload.data.jwt.id;
          newToken.user = <number><any>loginResponse.payload.data.data.user.id;
          newToken.expireAt = new Date(loginResponse.payload.data.data.exp*1000);
          newToken = await this.databaseService.mainConnection.getRepository(Jwt).save(newToken);
          basicProfile.jwt = newToken;
        }catch(e){
          console.log(`Error actualizando el registro del token: `,e);
          let currentUser = await this.databaseService.mainConnection.getRepository(User).findOne({
            loggedIn: true
          });
          if(currentUser){
            currentUser.loggedIn = false;
            await this.databaseService.mainConnection.getRepository(User).save(currentUser);
          }
        }

        try{
          //Almacenar el rol.
          //1. Buscamos el rol del usuario.
          let currentRole:Role = await this.databaseService.mainConnection.getRepository(Role)
          .findOne((<number>(<toJson.IRole>userJson.role).id));
          currentRole = (currentRole) ? currentRole : new Role();
          (<toJson.IRole>userJson.role).user = <number><any>loginResponse.payload.data.data.user.id;
          currentRole.fromJson((<toJson.IRole>userJson.role));
          currentRole = await this.databaseService.mainConnection.getRepository(Role).save(currentRole);
          basicProfile.role = currentRole;
        }catch(e){
          console.log("Error assigning role...");
          console.log(e);
          let currentUser = await this.databaseService.mainConnection.getRepository(User).findOne({
            loggedIn: true
          });
          if(currentUser){
            currentUser.loggedIn = false;
            await this.databaseService.mainConnection.getRepository(User).save(currentUser);
          }
        }

      }      

      //return "Usuario ha accedido correctamente";
      await this.loadPersonalProfile();
    }else{
      switch(loginResponse.payload.code){
        case LogInResult.INVALID_PASSWORD:  
          //return "Password Inválido";
        case LogInResult.INVALID_DATA:
          //return "Datos No Válidos";
        case LogInResult.USER_DOES_NOT_EXIST:
          //return "Usuario no encontrado";
        case LogInResult.USER_NOT_ACTIVE:
          //return "Usuario no tiene un status activo";
          case LogInResult.INTERNAL_ERROR:
            //return "Error del servidor";
      }
      this.loggedIn = false;
    }
    this.emitEvent(USER_SERVICE_EVENTS.LOGIN, loginResponse.payload.code);
    return loginResponse.payload.code;
  }

  public async fetchPersonalProfile(jwt:string){
    let profileSearchResponse:IRequests.UserSearchResponse;

    let personalProfileGet:IRequests.UserSearch = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:jwt
            }
        },
        payload:{
          content:{
            where:{},
            includedRelations:['membership','document','role']
          }
          ,resultMode: UserSearchResultMode.ENTITIES
      }
    };
    try{
      profileSearchResponse = await this._socket.call(SOCKET_CALL_ROUTES.PERSONAL_PROFILE_GET, <IRequests._BASE_REQUEST_PAYLOAD>personalProfileGet);  
    }catch(e){
      console.log("Error searching profile...",e);      
    };
    return profileSearchResponse.payload;
  }

  public get personalProfile(){
    return this._BasicProfile;
  }

  public get loggedOut(){
    return (this._BasicProfile == null) || (this._BasicProfile == undefined);
  }

  public async loadPersonalProfile():Promise<IBasicProfile>{
    let basicProfile:IBasicProfile = <any>{};    
    basicProfile.user = await this.databaseService.mainConnection.getRepository(User).findOne({
      loggedIn: true
    });
    if(basicProfile.user){
      basicProfile.jwt = await this.databaseService.mainConnection.getRepository(Jwt).findOne({
        user: basicProfile.user.id
      });
      basicProfile.role = await this.databaseService.mainConnection.getRepository(Role).findOne({
        user: <any>basicProfile.user.id
      });
      this._BasicProfile = basicProfile;
      this.loggedIn = true;
      this.emitEvent(USER_SERVICE_EVENTS.PROFILE_LOADED, this._BasicProfile);
      return this._BasicProfile;
    }else{
      this._BasicProfile = null;
      this.loggedIn = false;
      this.emitEvent(USER_SERVICE_EVENTS.PROFILE_LOADED, this._BasicProfile);
      return null;
    }
  }

  public async generateSuperAdmin(data:ISuperAdminCreationPayload):Promise<IRequests.SuperAdmin.CreationResponse>{

    let creationResponse:IRequests.SuperAdmin.CreationResponse;

    let loginRequestPayload:IRequests.SuperAdmin.Creation = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:null,
                login:{
                    username: null,
                    password: null,//superAdminData.password
                }
            }
        },
        payload: {
          content:data
        }
    };
    try{
      creationResponse = await this._socket.call(SOCKET_CALL_ROUTES.SUPER_ADMIN_ADD, <any>loginRequestPayload);  
      this.emitEvent(USER_SERVICE_EVENTS.SUPER_ADMIN_CREATED, {code:(<ISuperAdminCreationResult>(<any>creationResponse.payload.content)).result, e:creationResponse});
    }catch(e){
      console.log("Error creating super-admin...")
      console.log(e);
      this.emitEvent(USER_SERVICE_EVENTS.SUPER_ADMIN_CREATED, {code:SuperAdminCreationResult.INVALID_CREATION, e:creationResponse});
    };    
    return creationResponse;
  }

  public async generateAdmin(data:IAdminCreationPayload): Promise <IRequests.Admin.CreationResponse> {
    let creationResponse:IRequests.Admin.CreationResponse;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }

    let adminCreationRequestPayload:IRequests.Admin.Creation = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.personalProfile.jwt.token
            }
        },
        payload: {
          content:data
        }
    };
    try{
      creationResponse = await this._socket.call(SOCKET_CALL_ROUTES.ADMIN_ADD, <any>adminCreationRequestPayload);
      this.emitEvent(USER_SERVICE_EVENTS.ADMIN_CREATED, {code:(<IAdminCreationResult>(<any>creationResponse.payload.content)).result, e:creationResponse});
    }catch(e){
      this.emitEvent(USER_SERVICE_EVENTS.ADMIN_CREATED, {code:null, e:e});
    };
    return creationResponse;
  }

  public async updateAdmin(adminID: number, data: IAdminUpdatePayload){
    let updateResponse:IRequests.Admin.UpdateResponse;
    let loginRequestPayload:IRequests.Admin.Update = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.personalProfile.jwt.token
            }
        },
        payload: {
          id: adminID,
          content: data
        }
    };
    try{
      updateResponse = await this._socket.call(SOCKET_CALL_ROUTES.ADMIN_UPDATE, <any>loginRequestPayload);
      if(SOCKET_REQUEST_ERROR[`${updateResponse.payload}`] === undefined){
        this.emitEvent(USER_SERVICE_EVENTS.ADMIN_UPDATED, {code:(<IAdminUpdateResult>updateResponse.payload).result, e:updateResponse});
      }else{
        this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<SOCKET_REQUEST_ERROR>updateResponse.payload), e:updateResponse});
      }
    }catch(e){
      console.log("Error updating client...")
      console.log(e);
    };
    return updateResponse;
  }

  public async updateAdminRole(adminID: number, data: IRoleUpdatePayload){
    let updateResponse:IRequests.Admin.UpdateResponse;
    let loginRequestPayload:IRequests.Admin.UpdateRole = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.personalProfile.jwt.token
            }
        },
        payload: {
          id: adminID,
          content: data
        }
    };
    try{
      updateResponse = await this._socket.call(SOCKET_CALL_ROUTES.UPDATE_ROLE, <any>loginRequestPayload);
      if(SOCKET_REQUEST_ERROR[`${updateResponse.payload}`] === undefined){        
        this.emitEvent(USER_SERVICE_EVENTS.ADMIN_ROLE_UPDATED, {code:(<IRoleUpdateResult>updateResponse.payload).result, e:updateResponse});
      }else{
        this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<SOCKET_REQUEST_ERROR>updateResponse.payload), e:updateResponse});
      }
    }catch(e){
      console.log("Error updating admin role...")
      console.log(e);
    };
    return updateResponse;
  }

  public async incorporateClient(data:IClientCreationPayload): Promise <IRequests.Client.CreationResponse>{
      let clientCreationResponse:IRequests.Client.CreationResponse;
      if(!this.personalProfile){
        await this.loadPersonalProfile()
      }
      if(!this.personalProfile){
        return null;
      }

      let clientCreationRequest:IRequests.Client.Creation = {
          _meta:{
              _id: Math.floor(Math.random()*999999),
              _auth:{
                  jwt:this.personalProfile.jwt.token
              }
          },
          payload: {
            content:data
          }
      };
      try{
        clientCreationResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_ADD, <any>clientCreationRequest);
        this.emitEvent(USER_SERVICE_EVENTS.CLIENT_CREATED, {code:(<IClientCreationResult>(<any>clientCreationResponse.payload.content)).result, e:clientCreationResponse});
      }catch(e){
        this.emitEvent(USER_SERVICE_EVENTS.CLIENT_CREATED, {code:null, e:e});
      };
      return clientCreationResponse;
  }

  public async fetchAdminByDocument(documentPrefix: DOCUMENT_PREFIXES, content: string, additionalTables?:string[]):Promise<toJson.IUser[]>{
    let searchResponse:IRequests.UserSearchResponse;
    let searchPayload: IUserSearchOptions;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }

    searchPayload = {
      where:{
        document:{
          content:{
            prefix:{
              equal:documentPrefix
            },
            content:{
              equal:content
            }
          }
        }
      },
      includedRelations:additionalTables ? additionalTables : ['document']
    };
    let searchRequestPayload:IRequests.UserSearch = {
      _meta:{
          _id: Math.floor(Math.random()*999999),
          _auth:{
              jwt:this.personalProfile.jwt.token
          }
      },
      payload: {
        content:searchPayload
        ,resultMode:UserSearchResultMode.ENTITIES
      }
    };
    try{
      searchResponse = await this._socket.call(SOCKET_CALL_ROUTES.ADMIN_SEARCH, <any>searchRequestPayload);
      console.log(`
      
      searchResponse: `,searchResponse);
      if(searchResponse.payload 
        && 
        (<any[]>(<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content).length>0
      ){
        return (<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content;
      }else{
        return [];
      }
    }catch(e){
      console.log(`Error caught... `,e);
      return [];
    };
  }

  public async fetchClientByID(clientID:number, additionalTables?:string[]):Promise<toJson.IUser[]>{
    let searchResponse:IRequests.UserSearchResponse;
    let searchPayload: IUserSearchOptions;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }

    searchPayload = {
      where:{
        user:{
          meta:{
            id:{
              equal: clientID
            }
          }
        }
      },
      includedRelations:additionalTables ? additionalTables : ['document']
    };
    let searchRequestPayload:IRequests.UserSearch = {
      _meta:{
          _id: Math.floor(Math.random()*999999),
          _auth:{
              jwt:this.personalProfile.jwt.token
          }
      },
      payload: {
        content:searchPayload
        ,resultMode:UserSearchResultMode.ENTITIES
      }
    };
    try{
      searchResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_SEARCH, <any>searchRequestPayload);
      console.log(`
      
      searchResponse: `,searchResponse);
      if(searchResponse.payload 
        && 
        (<any[]>(<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content).length>0
      ){
        return (<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content;
      }else{
        return [];
      }
    }catch(e){
      console.log(`Error caught... `,e);
      return [];
    };
  }

  public async fetchClientByDocument(documentPrefix: DOCUMENT_PREFIXES, content: string, additionalTables?:string[]):Promise<toJson.IUser[]>{
    let searchResponse:IRequests.UserSearchResponse;
    let searchPayload: IUserSearchOptions;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }

    searchPayload = {
      where:{
        document:{
          content:{
            prefix:{
              equal:documentPrefix
            },
            content:{
              equal:content
            }
          }
        }
      },
      includedRelations:additionalTables ? additionalTables : ['document']
    };
    console.log(`
    

    searchPayload: `,searchPayload,`
    
    `);
    let searchRequestPayload:IRequests.UserSearch = {
      _meta:{
          _id: Math.floor(Math.random()*999999),
          _auth:{
              jwt:this.personalProfile.jwt.token
          }
      },
      payload: {
        content:searchPayload
        ,resultMode:UserSearchResultMode.ENTITIES
      }
    };
    try{
      searchResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_SEARCH, <any>searchRequestPayload);
      console.log(`
      
      searchResponse: `,searchResponse);
      if(searchResponse.payload 
        && 
        (<any[]>(<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content).length>0
      ){
        return (<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content;
      }else{
        return [];
      }
    }catch(e){
      console.log(`Error caught... `,e);
      return [];
    };
  }

  public async searchClient(searchPayload:IUserSearchOptions):Promise<toJson.IUser[]>{
    let searchResponse:IRequests.UserSearchResponse;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }
    
    let searchRequestPayload:IRequests.UserSearch = {
      _meta:{
          _id: Math.floor(Math.random()*999999),
          _auth:{
              jwt:this.personalProfile.jwt.token
          }
      },
      payload: {
        content:searchPayload
        ,resultMode:UserSearchResultMode.ENTITIES
      }
    };
    try{
      searchResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_SEARCH, <any>searchRequestPayload);
      console.log(searchResponse);
      if(searchResponse.payload 
        && 
        (<any[]>(<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content).length>0
      ){
        return (<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content;
      }else{
        return [];
      }
    }catch(e){
      console.log(`Error caught... `,e);
      return [];
    };
  }

  public async desincorporateClient(clientID: number){
    let desincorporationResponse:IRequests.Client.RemoveResponse;
    let desincorporatePayload: IRequests.Client.Remove;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }
    desincorporatePayload = {
        _meta:{
            _auth:{
                jwt: this.personalProfile.jwt.token
            },
            _id: Math.floor(Math.random()*999999999)
        },
        payload:{
            id:clientID
        }
    };
    desincorporationResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_REMOVE, <any>desincorporatePayload);
    
    if(SOCKET_REQUEST_ERROR[<SOCKET_REQUEST_ERROR>`${desincorporationResponse.payload}`] === undefined){
      this.emitEvent(USER_SERVICE_EVENTS.CLIENT_DESINCORPORATED, {code:(<IClientRemoveResult>desincorporationResponse.payload).result, e:desincorporationResponse});
    }else{
      this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<IClientRemoveResult>desincorporationResponse.payload).result, e:desincorporationResponse});
    }
    return desincorporationResponse;
  }

  public async removeAdmin(adminID: number){
    let adminRemovalResponse:IRequests.Admin.RemoveResponse;
    let desincorporatePayload: IRequests.Admin.Remove;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }
    desincorporatePayload = {
        _meta:{
            _auth:{
                jwt: this.personalProfile.jwt.token
            },
            _id: Math.floor(Math.random()*999999)
        },
        payload:{
            id:adminID
        }
    };
    adminRemovalResponse = await this._socket.call(SOCKET_CALL_ROUTES.ADMIN_REMOVE, <any>desincorporatePayload);
    
    if(SOCKET_REQUEST_ERROR[<SOCKET_REQUEST_ERROR>`${adminRemovalResponse.payload}`] === undefined){
      this.emitEvent(USER_SERVICE_EVENTS.ADMIN_REMOVED, {code:(<IAdminRemoveResult>adminRemovalResponse.payload).result, e:adminRemovalResponse});
    }else{
      this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<IAdminRemoveResult>adminRemovalResponse.payload).result, e:adminRemovalResponse});
    }
    return adminRemovalResponse;
  }

  public async restoreAdmin(adminID: number){
    let adminRemovalResponse:IRequests.Admin.RemoveResponse;
    let desincorporatePayload: IRequests.Admin.Remove;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }
    desincorporatePayload = {
        _meta:{
            _auth:{
                jwt: this.personalProfile.jwt.token
            },
            _id: Math.floor(Math.random()*999999)
        },
        payload:{
            id:adminID
        }
    };
    adminRemovalResponse = await this._socket.call(SOCKET_CALL_ROUTES.ADMIN_RESTORE, <any>desincorporatePayload);
    
    if(SOCKET_REQUEST_ERROR[<SOCKET_REQUEST_ERROR>`${adminRemovalResponse.payload}`] === undefined){
      this.emitEvent(USER_SERVICE_EVENTS.ADMIN_RESTORED, {code:(<IAdminRemoveResult>adminRemovalResponse.payload).result, e:adminRemovalResponse});
    }else{
      this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<IAdminRemoveResult>adminRemovalResponse.payload).result, e:adminRemovalResponse});
    }
    return adminRemovalResponse;
  }

  public async searchAdmin(searchPayload:IUserSearchOptions):Promise<toJson.IUser[]>{
    let searchResponse:IRequests.UserSearchResponse;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }
    
    let searchRequestPayload:IRequests.UserSearch = {
      _meta:{
          _id: Math.floor(Math.random()*999999),
          _auth:{
              jwt:this.personalProfile.jwt.token
          }
      },
      payload: {
        content:searchPayload
        ,resultMode:UserSearchResultMode.ENTITIES
      }
    };
    try{
      searchResponse = await this._socket.call(SOCKET_CALL_ROUTES.ADMIN_SEARCH, <any>searchRequestPayload);
      if(searchResponse.payload 
        && (<any[]>(<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content)
        && 
        (<any[]>(<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content).length>0
      ){
        return (<IRequests.UserSearchSuccessfullResponse><any>searchResponse.payload).content;
      }else{
        return [];
      }
    }catch(e){
      console.log(`Error caught... `,e);
      return [];
    };
  }

  public async reincorporateClient(clientID: number){
    let desincorporationResponse:IRequests.Client.RemoveResponse;
    let desincorporatePayload: IRequests.Client.Remove;
    if(!this.personalProfile){
      await this.loadPersonalProfile()
    }
    if(!this.personalProfile){
      return null;
    }
    desincorporatePayload = {
        _meta:{
            _auth:{
                jwt: this.personalProfile.jwt.token
            },
            _id: Math.floor(Math.random()*9999999)
        },
        payload:{
            id:clientID
        }
    };
    desincorporationResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_RESTORE, <any>desincorporatePayload);
    if(SOCKET_REQUEST_ERROR[<SOCKET_REQUEST_ERROR>`${desincorporationResponse.payload}`] === undefined){
      this.emitEvent(USER_SERVICE_EVENTS.CLIENT_RESTORED, {code:(<IClientRemoveResult>desincorporationResponse.payload).result, e:desincorporationResponse});
    }else{
      this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<IClientRemoveResult>desincorporationResponse.payload).result, e:desincorporationResponse});
    }
    return desincorporationResponse;
  }

  public async logOut(): Promise<boolean>{
    await this.loadPersonalProfile();
      try{
        let logOutResponse:IRequests.Auth.LogOutResponse;
        if(!this.loggedIn || !this.personalProfile){
          await this.loadPersonalProfile();
        }
        if(this.loggedIn && this.personalProfile){
          //1. Salimos del sistema.
          let logOutRequest:IRequests.Auth.LogOut = {
            _meta:{
                _id: Math.floor(Math.random()*999999),
                _auth:{
                    jwt:this.personalProfile.jwt.token
                }
            }
          }

          try{
            logOutResponse = await this._socket.call(SOCKET_CALL_ROUTES.AUTH_LOGOUT, <IRequests._BASE_REQUEST_PAYLOAD>logOutRequest);
          }catch(e){
            this.emitEvent(USER_SERVICE_EVENTS.LOGOUT, {code:LogOutResult.INTERNAL_ERROR, e:e});
            return false;    
          };

          console.log(`logOutResponse: `,logOutResponse);

          if(logOutResponse.payload.logOut){
            //2. Eliminamos información de sesión local
            await this.databaseService.mainConnection.getRepository(User).remove(this._BasicProfile.user);
            await this.databaseService.mainConnection.getRepository(Jwt).remove(this._BasicProfile.jwt);
            await this.databaseService.mainConnection.getRepository(Role).remove(this._BasicProfile.role);
            await this.loadPersonalProfile();
            this.emitEvent(USER_SERVICE_EVENTS.LOGOUT, {code:logOutResponse.payload.code, e:null});
          }else{
            await this.databaseService.mainConnection.getRepository(User).remove(this._BasicProfile.user);
            await this.databaseService.mainConnection.getRepository(Jwt).remove(this._BasicProfile.jwt);
            await this.databaseService.mainConnection.getRepository(Role).remove(this._BasicProfile.role);
            await this.loadPersonalProfile();
            this.emitEvent(USER_SERVICE_EVENTS.LOGOUT, {code:logOutResponse.payload.code, e:null});
          }
        }else{
          this.emitEvent(USER_SERVICE_EVENTS.LOGOUT, {code:LogOutResult.SUCCESS, e:null});
        }
      }catch(e){
        try{
          await this.databaseService.mainConnection.getRepository(User).clear();
          await this.databaseService.mainConnection.getRepository(Jwt).clear();
          await this.databaseService.mainConnection.getRepository(Role).clear();
          await this.loadPersonalProfile();
        }catch(e){
          this.emitEvent(USER_SERVICE_EVENTS.LOGOUT, {code:LogOutResult.INTERNAL_ERROR, e:e});
          console.log(e);
        }        
        return false;
      }
      return true;
  }

  public async updateSuperAdmin(password:string, data:ISuperAdminUpdatePayload):Promise<IRequests.SuperAdmin.UpdateResponse> {
    let updateResponse:IRequests.SuperAdmin.UpdateResponse;
    let loginRequestPayload:IRequests.SuperAdmin.Update = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:null,
                login:{
                    username: null,
                    password: password,//superAdminData.password
                }
            }
        },
        payload: data
    };
    try{
      updateResponse = await this._socket.call(SOCKET_CALL_ROUTES.SUPER_ADMIN_UPDATE, <any>loginRequestPayload);  
    }catch(e){
      console.log("Error updating super-admin...")
      console.log(e);
    };
    return updateResponse;
  }

  public async updateClient(clientID: number, data:ISuperAdminUpdatePayload):Promise<IRequests.Client.UpdateResponse> {
    let updateResponse:IRequests.Client.UpdateResponse;
    let loginRequestPayload:IRequests.Client.Update = {
        _meta:{
            _id: Math.floor(Math.random()*999999),
            _auth:{
                jwt:this.personalProfile.jwt.token
            }
        },
        payload: {
          id: clientID,
          content: data
        }
    };
    try{
      updateResponse = await this._socket.call(SOCKET_CALL_ROUTES.CLIENT_UPDATE, <any>loginRequestPayload);
      if(SOCKET_REQUEST_ERROR[`${updateResponse.payload}`] === undefined){
        this.emitEvent(USER_SERVICE_EVENTS.CLIENT_UPDATED, {code:(<IClientUpdateResult>updateResponse.payload).result, e:updateResponse});
      }else{
        this.emitEvent(USER_SERVICE_EVENTS.SOCKET_REQUEST_ERROR, {code:(<SOCKET_REQUEST_ERROR>updateResponse.payload), e:updateResponse});
      }
    }catch(e){
      console.log("Error updating client...")
      console.log(e);
    };
    return updateResponse;
  }

  public emitEvent(eventID: USER_SERVICE_EVENTS, eventData: any){
    this.subject.next({event:eventID, data:eventData});
  }


  //Permisos

  public get canDesincorporate(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canDesincorporateClient);
  }

  public get canIncorporate(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canIncorporateClient);
  }

  public get canSearchClients(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canSearchClient);
  }

  public get canConsultClients(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canSearchClient);
  }

  public get canUpdateClient(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canUpdateClient);
  }

  public get canBackupAndRestore(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canExportData);
  }

  public get canAddAdmin(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canAddAdmin);
  }

  public get canRemoveAdmin(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canRemoveAdmin);
  }

  public get canSearchAdmin(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canSearchAdmin);
  }

  public get canRestoreAdmin(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canRemoveAdmin);
  }

  public get canUpdateAdmin(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canUpdateAdmin);
  }

  public get canAddPayments(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canAddPayment);
  }

  public get canSearchPayments(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canSearchPayment);
  }

  public get canExportData(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canExportData);
  }

  public get canImportData(){
    return !!(this.loggedIn && this.personalProfile.role && this.personalProfile.role.canImportData);
  }

}
