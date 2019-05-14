import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm/browser';
import { BaseRole } from '../models/BaseRole';
import { Company } from '../models/Company';
import { Currency } from '../models/Currency';
import { Jwt } from '../models/Jwt';
import { Log } from '../models/Log';
import { LogActions } from '../models/LogActions';
import { Login } from '../models/Login';
import { Membership } from '../models/Membership';
import { Payment } from '../models/Payment';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { UserContact } from '../models/UserContact';
import { LogContent } from '../models/audit/LogContent';
import {Document as Doc} from '../models/Document';
import { Configuration } from '../models/Configuration';


export class DatabaseService {
    private _testing: boolean;
    private static _instance: DatabaseService;
    public readonly _testingConfig = {
        primary: {
            connection: {
                type: "sqljs",
                location: "main_test",
                name:'main_test',
                autoSave: true,
                entities: [
                    User,
                    BaseRole,
                    Company,
                    Currency,
                    Doc,
                    Jwt,
                    Log,
                    LogActions,
                    Login,
                    Membership,
                    Payment,
                    Role,
                    UserContact,
                    Configuration
                ],
                logging: false,
                synchronize: true
            }
        },
        audit: {
            connection: {
                type: "sqljs",
                location: "audit_test",
                name:'audit_test',
                autoSave: true,
                entities: [
                    LogContent
                ],
                logging: false,
                synchronize: true
            }
        }
    }
    public readonly _prodConfig = {
        primary: {
            connection: {
                type: "sqljs",
                location: "main_prod",
                name:'main_prod',
                autoSave: true,
                entities: [
                    User,
                    BaseRole,
                    Company,
                    Currency,
                    Doc,
                    Jwt,
                    Log,
                    LogActions,
                    Login,
                    Membership,
                    Payment,
                    Role,
                    UserContact,
                    Configuration
                ],
                logging: false
            }
        },audit: {
            connection: {
                type: "sqljs",
                location: "audit_prod",
                name:'audit_prod',
                autoSave: true,
                entities: [
                    LogContent
                ],
                logging: false
            }
        }
    }

    /**@description Conexión usada para las operaciones principales de la base de datos. */
    private _primaryConnection: Connection;
    /**@description Conexión usada para guardar los logs extendidos (con contenido) para motivos de auditoría */
    private _auditConnection: Connection;
    
    constructor(){

    }

    public set testing(testing: boolean){
        this._testing = testing;
    }

    public get testing(){
        return this._testing;
    }

    public get connection(): Connection{
        return this._primaryConnection;
    }

    public get auditConnection(): Connection{
        return this._auditConnection;
    }

    public async closeConnection(){        
        let result = (this._primaryConnection && this._primaryConnection.isConnected) ?  await this._primaryConnection.close() : new Error('Connection not initialized...');
        return result;
    }

    public static get Instance(): DatabaseService{
        this._instance = (this._instance || new DatabaseService());
        return this._instance;
    }

    public async initialize() {
        if(!this._primaryConnection || !this._primaryConnection.isConnected){
            let primaryConnectionData: any = this.testing ? this._testingConfig.primary.connection : this._prodConfig.primary.connection;
            let auditConnectionData: any = this.testing ? this._testingConfig.audit.connection : this._prodConfig.audit.connection;
            try{
                this._primaryConnection = await createConnection(primaryConnectionData);
                this._auditConnection = await createConnection(auditConnectionData);
            }catch(e){
                console.log("Error sucedido...", e);
                return false;
            }
        }else{
            return true;
        }
    }


    public async saveModel(model: any){
        let result = await this._primaryConnection.manager.save(model);
        return result;
    }
}