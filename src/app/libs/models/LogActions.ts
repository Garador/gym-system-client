import { Entity, UpdateDateColumn, Column, PrimaryColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import {TableNames} from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import defaultLogActions from '../base/LogActions';


/**
 * @description Especifica las acciones a logear en la base de datos.
 */
@Entity({
    name: TableNames.LogActions.table_name
})
export class LogActions implements ITableMetadata {

    private static _instance: LogActions;

    //+Metadata
    @PrimaryColumn({
        name:TableNames.LogActions.id
    })
    id: number;

    @Column({
        name:TableNames.LogActions.createdAt
    })
    createdAt: Date;

    @Column({
        name:TableNames.LogActions.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.LogActions.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.LogActions.auth_login
    })
    Log_Login: boolean;

    @Column({
        name:TableNames.LogActions.auth_logout
    })
    Log_LogOut: boolean;

    @Column({
        name:TableNames.LogActions.auth_change_password
    })
    Log_ChangePassword: boolean;

    @Column({
        name:TableNames.LogActions.admin_add
    })
    Log_AddAdmin: boolean;

    @Column({
        name:TableNames.LogActions.admin_update
    })
    Log_UpdateAdmin: boolean;

    @Column({
        name:TableNames.LogActions.admin_remove
    })
    Log_RemoveAdmin: boolean;

    @Column({
        name:TableNames.LogActions.admin_search
    })
    Log_SearchAdmin: boolean;

    @Column({
        name:TableNames.LogActions.data_export
    })
    Log_ExportData: boolean;

    @Column({
        name:TableNames.LogActions.data_import
    })
    Log_ImportData: boolean;

    @Column({
        name:TableNames.LogActions.client_incorporate
    })
    Log_IncorporateClient: boolean;

    @Column({
        name:TableNames.LogActions.client_udpate
    })
    Log_UpdateClient: boolean;

    @Column({
        name:TableNames.LogActions.client_desincorporate
    })
    Log_DesincorporateClient: boolean;

    @Column({
        name:TableNames.LogActions.client_search
    })
    Log_SearchClient: boolean;

    @Column({
        name:TableNames.LogActions.payment_add
    })
    Log_AddPayment: boolean;

    @Column({
        name:TableNames.LogActions.payment_update
    })
    Log_UpdatePayment: boolean;

    @Column({
        name:TableNames.LogActions.payment_search
    })
    Log_SearchPayment: boolean;

    @Column({
        name:TableNames.LogActions.payment_remove
    })
    Log_RemovePayment: boolean;                         //Eliminar Pagos

    @Column({
        name:TableNames.LogActions.role_update
    })
    Log_UpdateUserRoles: boolean;

    public static get Instance(){
        return LogActions._instance;
    }

    public static async load(){
        
    }
    
    //-Columnas
    //+Lláves Foráneas
    //-Lláves Foráneas
}