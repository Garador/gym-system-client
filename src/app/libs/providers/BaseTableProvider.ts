import {BaseRole} from '../models/BaseRole';
import {Currency} from '../models/Currency';
import {Company} from '../models/Company';
import {TableMapping, TableNames} from '../enums/Database';
import { LogActions } from '../models/LogActions';

//Clase singleton encargada de proveer las tablas base.
//Tablas base:
//1. rol_base.
//2. moneda.
//3. Company (se puede modificar luego)
//Genera / Carga los usuarios por defecto en caso de no encontrarlos en la base de datos:
//1. Si no encuentra un SuperAdmin, lo agrega.
export class BaseTableProvider {
    private static _instance: BaseTableProvider;
    public baseRoles: BaseRole[] = [];
    public baseCurrency:Currency[] = [];
    public baseCompany: Company;
    public logPreferences: LogActions;

    constructor(){

    }

    public static get Instance (){
        BaseTableProvider._instance = (BaseTableProvider._instance) ? BaseTableProvider._instance : new BaseTableProvider();
        return BaseTableProvider._instance;
    }

    public async init(){     
    }

    public async loadBaseRoles(): Promise<BaseRole[]> {
        return null;
    }

    public async loadBaseCurrency(): Promise<Currency[]> {
        return null;
    }

    public async loadCompany(): Promise<Company>{
        return null;
    }

    public async loadLogPreferences(): Promise <LogActions>{
        await LogActions.load();
        return LogActions.Instance;
    }

    public static assembleBaseRolePayload(jsonRole: any): BaseRole {
        let roleBase = new BaseRole();
        
        roleBase.id = jsonRole[TableMapping.Role_base.id];
        roleBase.name = jsonRole[TableMapping.Role_base.name];
        roleBase.version = jsonRole[TableMapping.Role_base.version];
        roleBase.status = jsonRole[TableMapping.Role_base.status];
        if(jsonRole[TableMapping.Role_base.createdAt]){
            roleBase.createdAt = jsonRole[TableMapping.Role_base.createdAt];
        }
        if(jsonRole[TableMapping.Role_base.updatedAt]){
            roleBase.updatedAt = jsonRole[TableMapping.Role_base.updatedAt];
        }

        roleBase.canLogin = jsonRole[TableMapping.Role_base.canLogin];
        roleBase.canChangePassword = jsonRole[TableMapping.Role_base.canChangePassword];
        roleBase.canAddAdmin = jsonRole[TableMapping.Role_base.canAddAdmin];
        roleBase.canUpdateAdmin = jsonRole[TableMapping.Role_base.canUpdateAdmin];
        roleBase.canRemoveAdmin = jsonRole[TableMapping.Role_base.canRemoveAdmin];
        roleBase.canSearchAdmin = jsonRole[TableMapping.Role_base.canSearchAdmin];
        roleBase.canExportData = jsonRole[TableMapping.Role_base.canExportData];
        roleBase.canImportData = jsonRole[TableMapping.Role_base.canImportData];
        roleBase.canIncorporateClient = jsonRole[TableMapping.Role_base.canIncorporateClient];
        roleBase.canUpdateClient = jsonRole[TableMapping.Role_base.canUpdateClient];
        roleBase.canDesincorporateClient = jsonRole[TableMapping.Role_base.canDesincorporateClient];
        roleBase.canSearchClient = jsonRole[TableMapping.Role_base.canSearchClient];
        roleBase.canAddPayment = jsonRole[TableMapping.Role_base.canAddPayment];
        roleBase.canUpdatePayment = jsonRole[TableMapping.Role_base.canUpdatePayment];
        roleBase.canRemovePayment = jsonRole[TableMapping.Role_base.canRemovePayment];
        roleBase.canSearchPayment = jsonRole[TableMapping.Role_base.canSearchPayment];
        roleBase.canUpdateUserRoles = jsonRole[TableMapping.Role_base.canUpdateUserRoles];
        
        return roleBase;
    }

    public static assembleCurrencyPayload(jsonCurrency: any): Currency {
        let currency            = new Currency();
        currency.id             = jsonCurrency[TableMapping.Currency.id];

        if(jsonCurrency[TableMapping.Currency.createdAt]){
            currency.createdAt  = jsonCurrency[TableMapping.Currency.createdAt];
        }
        if(jsonCurrency[TableMapping.Currency.updatedAt]){
            currency.updatedAt  = jsonCurrency[TableMapping.Currency.updatedAt];
        }
        currency.status         = jsonCurrency[TableMapping.Currency.status];
        currency.isoCode        = jsonCurrency[TableMapping.Currency.isoCode];
        currency.decimals       = jsonCurrency[TableMapping.Currency.decimals];
        currency.displayName    = jsonCurrency[TableMapping.Currency.displayName];
        return currency;
    }

    public static assembleCompanyPayload(jsonCompany: any): Company {
        let company             = new Company();
        company.id              = jsonCompany[TableMapping.Company.id];
        if(jsonCompany[TableMapping.Company.createdAt]){
            company.createdAt   = jsonCompany[TableMapping.Company.createdAt];
        }
        if(jsonCompany[TableMapping.Company.updatedAt]){
            company.updatedAt   = jsonCompany[TableMapping.Company.updatedAt];
        }
        company.status          = jsonCompany[TableMapping.Company.status];
        company.name            = jsonCompany[TableMapping.Company.name];
        company.description     = jsonCompany[TableMapping.Company.description];

        return company;
    }

}