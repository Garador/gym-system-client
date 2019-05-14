import { IUserSearchOptions } from "../interfaces/User";
import { UserSearchResultMode } from "../enums/User";
import { User } from "../models/User";
import { TableAlias, TableNames } from "../enums/Database";
import { DatabaseService } from "./DatabaseProvider";
import { UserSearchValidator, PaymentSearchValidator, LogSearchValidator } from "./SyntaxValidationProvider";
import { Membership } from "../models/Membership";
import { Role } from "../models/Role";
import { Jwt } from "../models/Jwt";
import { Login } from "../models/Login";
import {Document as Doc} from '../models/Document';
import { IPaymentSearchOption } from "../interfaces/Payment";
import { PaymentResultMode } from "../enums/Payment";
import { Currency } from "../models/Currency";
import { Payment } from "../models/Payment";
import { LogResultMode } from "../enums/Log";
import { ILogSearchOptions } from "../interfaces/Log";
import { Log } from "../models/Log";

export class SearchProvider {

    private static _instance:SearchProvider;

    constructor(){

    }

    public static get Instance(): SearchProvider {
        this._instance = (this._instance) ? this._instance : new SearchProvider();
        return this._instance;
    }


    /**
     * @param searchOptions Opciones de búsqueda del usuario
     * @param resultMode    Opciones de resultados para el usuario
     * @description         Ejecuta una búsqueda de usuarios por diferentes parámetros establecidos en IUserSearchOptions.
     */
    public async searchUser(searchOptions:IUserSearchOptions, resultMode?:UserSearchResultMode){
        
        //*/
        //result = query.getSql();
    }


    public buildUserSearchQuery(searchParameters:IUserSearchOptions){

    }


    public async searchPayment(searchOptions: IPaymentSearchOption, resultMode: PaymentResultMode){
        
    }

    public buildPaymentSearchQuery(searchParameters: IPaymentSearchOption){

    }

    public async searchLogs(searchOptions: ILogSearchOptions, resultMode: LogResultMode){
        
    }

    public buildLogSearchQuery(searchParameters: ILogSearchOptions){

    }

}