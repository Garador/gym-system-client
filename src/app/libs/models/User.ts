//Enums & Interfaces
import {
    ITableMetadata
} from '../interfaces/TableStructure';
import {
    ISuperAdminCreationPayload,
    ISuperAdminCreationResult,
    ILogOutResult,
    ILogInResult,
    IAdminCreationPayload,
    IAdminCreationResult,
    IClientCreationPayload,
    IClientCreationResult,
    ISuperAdminUpdateResult,
    ISuperAdminUpdatePayload,
    IAdminUpdatePayload,
    IAdminUpdateResult,
    IClientUpdatePayload,
    IClientUpdateResult,
    IPaymentAddPayload,
    IPaymentAddResult,
    IRoleUpdatePayload,
    IRoleUpdateResult,
    IAdminRemoveResult,
    IClientRemoveResult,
    IClientRestoreResult,
    IAdminRestoreResult,
    IUserSearchOptions
} from '../interfaces/User';
import {
    UserSearchResultMode
} from '../enums/User';
import {
    BASE_ROLE_IDS
} from '../enums/Roles';
//Providers
//Models
import {
    Login
} from './Login';
import {
    Jwt
} from './Jwt';
import {
    Document as Doc
} from './Document';
import {
    Role
} from './Role';
import {
    Membership
} from './Membership';
//import { Log } from './Log';
import {
    UserContact
} from './UserContact';
//Others
import { toJson } from '../interfaces/Socket';
import { Entity, PrimaryColumn, Column } from 'typeorm/browser';
import { TableNames } from '../enums/Database';

@Entity({
    name: TableNames.User.table_name
})
export class User implements ITableMetadata {    

    //+Metadata
    @PrimaryColumn({
        name: TableNames.User.id
    })
    id: number;

    @Column({
        name: TableNames.User.createdAt
    })
    createdAt: Date;

    @Column({
        name: TableNames.User.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.User.status
    })
    status: number;
    //-Metadata

    //+Datos de la tabla
    @Column({
        name: TableNames.User.name,
        length: 60
    })
    firstName: string;

    @Column({
        name: TableNames.User.surname,
        length: 60
    })
    surName: string;

    @Column({
        name: TableNames.User.foreign_key_document
        ,nullable: true
    })
    document: number; //Documento de Identidad
    
    @Column({
        name: TableNames.User.address,
        nullable: true
    })
    address: string;
    
    @Column({
        name: TableNames.User.phone,
        nullable: true
    })
    phone: string;


    @Column({
        name: TableNames.User.foreign_key_login
        ,nullable: true
    })
    login: number; //Login

    @Column({
        name: TableNames.User.foreign_key_jwt
        ,nullable: true
    })
    jwt: number; //JWT

    @Column({
        name: TableNames.User.foreign_key_role
        ,nullable: true
    })
    role: number; //ID del rol al que pertenece

    @Column({
        name: TableNames.User.foreign_key_membership
        ,nullable: true
    })
    membership: number;

    @Column({
        name: TableNames.User.loggedin
        ,unique: true
        ,default: false
    })
    loggedIn: boolean;
    

    public async loadLogs(paging?:{skip?:number, take?:number}){
       
    }


    public fromJson(json: toJson.IUser) {

        this.firstName = json.firstName;

        this.surName = json.surName;

        this.id = json.id;

        this.updatedAt = json.updatedAt;

        this.createdAt = json.createdAt;

        this.status = json.status;

        this.document = (!isNaN(<number><any>json.document)) ? <number>json.document : (()=>{
            if(json.document != null && json.document != undefined){
                if(!isNaN((<toJson.IDocument>(<any>(json.document))).id)){
                    return ((<toJson.IDocument><any>(json.document))).id;
                }else{
                    return null;
                }
            }else{
                return null;
            }
        })();

        this.role = (!isNaN(<number><any>json.role)) ? <number>json.role : (()=>{
            if(json.role != null && json.role != undefined){
                if(!isNaN((<toJson.IRole>(<any>(json.role))).id)){
                    return ((<toJson.IRole><any>(json.role))).id;
                }else{
                    return null;
                }
            }else{
                return null;
            }
        })();

        this.login = (!isNaN(<number><any>json.login)) ? <number>json.login : (()=>{
            if(json.login != null && json.login != undefined){
                if(!isNaN((<toJson.ILogin>(<any>(json.login))).id)){
                    return (<toJson.ILogin><any>((json.login))).id;
                }else{
                    return null;
                }
            }else{
                return null;
            }
        })();;

        this.membership = (!isNaN(<number><any>json.membership)) ? <number>json.membership : (()=>{
            if(json.membership != null && json.membership != undefined){
                if(!isNaN((<toJson.IMembership>(<any>(json.membership))).id)){
                    return ((<toJson.IMembership><any>(json.membership))).id;
                }else{
                    return null;
                }
            }else{
                return null;
            }
        })();
    }

    public toJson(): toJson.IUser{
        return {
            firstName: this.firstName,
            surName: this.surName,
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            document: <any>this.document,
            role: <any>this.login,
            login: <any>this.login,
            address: this.address,
            phone: this.phone,
            membership: <any>this.membership
        }
    }

    /**
     * @param username Nombre de usuario.
     * @param rawPassword Password sin ofuscar.
     * @implements ITokenInterface
     * @returns Genera un nuevo token (o lo actualiza) con la información del rol del usuario, luego de almacenarlo como un registro jwt.
     */
    public static async logIn(username: string, rawPassword: string): Promise < ILogInResult > {
        return null;
    }

    public static async logOut(jwt: string): Promise < ILogOutResult > {
        return null;
        
    }


    public static async getByID(userID: number, additionalTables ? : string[]): Promise < User > {
        return null;
        
    }

    public static async getByUsername(username: string, additionalTables ? : string[] | null): Promise < User > {
        return null;
        
    }

    public static async getByRoleName(baseRoleName: string, additionalTables ? : string[]): Promise < User[] > {
        return null;
        
    }

    public static async getByDocument(prefix: string, content: string, additionalTables ? : string[] | null): Promise < User > {
        return null;
        
    }

    public static async getSuperUser(additionalTables ? : string[]): Promise < User > {
        return null;
        
    }

    public static async createSuperAdmin(payload: ISuperAdminCreationPayload): Promise < ISuperAdminCreationResult > {
        return null;
        
    }

    public static async updateSuperAdmin(payload: ISuperAdminUpdatePayload): Promise < ISuperAdminUpdateResult > {
        return null;
        //0. Validamos Payload.
        
    }

    public async createAdmin(payload: IAdminCreationPayload): Promise < IAdminCreationResult > {
        return null;
        
    }

    /**
     * 
     * @param adminID ID del Admin a actualizar; numérico.
     * @param payload Objeto {
     return null;IAdminUpdatePayload}.
     * @description Actualiza el perfil de un admin. Si no tiene un documento asignado, lo crea
     * siempre y cuando el prefijo y el contenido se encuentren correctos.
     */
    public async updateAdmin(adminID: number, payload: IAdminUpdatePayload): Promise < IAdminUpdateResult > {
        return null;
        //0. Validamos Payload.
        
    }

    /**
     * 
     * @param adminID El ID de usuario del admin a eliminar.
     * @description Elimina un admin del sistema. Si el admin tiene operaciones realizadas (se encuentra un log
     * a su ID de usuario), el admin se eliminará de manera lógica (cambiando el estatus a ADMIN_DELETED).
     * De otra manera, se eliminará físicamente.
     */
    public async removeAdmin(adminID: number): Promise<IAdminRemoveResult> {
        return null;
        
    }

    /**
     * 
     * @param adminID El ID de cliente a eliminar.
     * @description Elimina un cliente de la base de datos. Si el cliente tiene operaciones realizadas
     * a su nombre (logs) o posee pagos realizados, se realiza una eliminación lógica.
     * De otra manera, se eliminará físicamente de la base de datos.
     */
    public async removeClient(clientID: number): Promise<IClientRemoveResult> {
        return null;
        
    }

    /**
     * 
     * @param adminID El ID de cliente a restaurar.
     * @description Restaura lógicamente un cliente de la base de datos si este ha sido eliminado de manera lógica.
     */
    public async restoreClient(clientID: number): Promise<IClientRestoreResult> {
        return null;
        
    }

    /**
     * 
     * @param adminID El ID de admin a restaurar.
     * @description Restaura lógicamente un admin de la base de datos si este ha sido eliminado de manera lógica.
     */
    public async restoreAdmin(clientID: number): Promise<IAdminRestoreResult> {
        return null;
        
    }


    /**
     * @param payload Payload de creación
     * @description Genera un nuevo cliente en la base de datos.
     */
    public async createClient(payload: IClientCreationPayload): Promise < IClientCreationResult > {
        return null;
        
    }

    /**
     * @param clientID ID del clientea actualizar; numérico.
     * @param payload Objeto {
     return null;ICLientUpdatePayload}.
     * @description Actualiza el perfil de un usuario.
     */
    public async updateClient(clientID: number, payload: IClientUpdatePayload): Promise < IClientUpdateResult > {
        return null;
        //0. Validamos Payload.
        
    }

    /**
     * 
     * @param clientID ID del cliente a agregar el pago
     * @param payload Payload de la información del cliente.
     * @description Agrega un pago a un cliente, y actualiza la fecha de corte (si ha sido proveida).
     */
    public async addPayment(clientID: number, payload: IPaymentAddPayload): Promise < IPaymentAddResult > {
        return null;
        
    }


    /**
     * 
     * @param adminID ID de la cuenta (user) del Admin a actualizar
     * @param payload Data del rol a actualizar
     * @description Actualiza un rol de un Admin.
     */
    public async updateAdminRole(adminID: number, payload: IRoleUpdatePayload): Promise < IRoleUpdateResult > {
        return null;
        
    }


    public static async searchUser(searchOptions:IUserSearchOptions, resultMode?:UserSearchResultMode){
        
    }
}