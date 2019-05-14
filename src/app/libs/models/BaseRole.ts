import {ITableMetadata} from '../interfaces/TableStructure';
import {IRole} from '../interfaces/Role';
import { toJson } from "../interfaces/Socket";

import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm/browser';
import { TableNames } from '../enums/Database';

@Entity({
    name: TableNames.Role_base.table_name
})
export class BaseRole implements ITableMetadata, IRole {

    //+Metadata
    //@PrimaryGeneratedColumn()
    @PrimaryColumn({
        name:TableNames.Role_base.id
    })
    id: number;

    @Column({
        name:TableNames.Role_base.createdAt
    })
    createdAt: Date;

    @Column({
        name:TableNames.Role_base.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Role_base.status
    })
    status: number;

    @Column({
        name:TableNames.Role_base.version
    })
    version: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.Role_base.role_name
    })
    name: string;

    @Column({
        name:TableNames.Role_base.auth_login
    })
    canLogin: boolean;

    @Column({
        name:TableNames.Role_base.auth_change_password
    })
    canChangePassword: boolean;

    @Column({
        name:TableNames.Role_base.admin_add
    })
    canAddAdmin: boolean;

    @Column({
        name:TableNames.Role_base.admin_update
    })
    canUpdateAdmin: boolean;

    @Column({
        name:TableNames.Role_base.admin_remove
    })
    canRemoveAdmin: boolean;

    @Column({
        name:TableNames.Role_base.admin_search
    })
    canSearchAdmin: boolean;

    @Column({
        name:TableNames.Role_base.data_export
    })
    canExportData: boolean;

    @Column({
        name:TableNames.Role_base.data_import
    })
    canImportData: boolean;

    @Column({
        name:TableNames.Role_base.client_incorporate
    })
    canIncorporateClient: boolean;

    @Column({
        name:TableNames.Role_base.client_udpate
    })
    canUpdateClient: boolean;

    @Column({
        name:TableNames.Role_base.client_desincorporate
    })
    canDesincorporateClient: boolean;

    @Column({
        name:TableNames.Role_base.client_search
    })
    canSearchClient: boolean;

    @Column({
        name:TableNames.Role_base.payment_add
    })
    canAddPayment: boolean;

    @Column({
        name:TableNames.Role_base.payment_update
    })
    canUpdatePayment: boolean;

    @Column({
        name:TableNames.Role_base.payment_remove
    })
    canRemovePayment: boolean;                         //Eliminar Pagos

    @Column({
        name:TableNames.Role_base.payment_search
    })
    canSearchPayment: boolean;

    @Column({
        name:TableNames.Role_base.role_update
    })
    canUpdateUserRoles: boolean;


    public toJson(): toJson.IBaseRole {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            version: this.version,
            name: this.name,
            canLogin: this.canLogin,
            canChangePassword: this.canChangePassword,
            canAddAdmin: this.canAddAdmin,
            canUpdateAdmin: this.canUpdateAdmin,
            canRemoveAdmin: this.canRemoveAdmin,
            canSearchAdmin: this.canSearchAdmin,
            canExportData: this.canExportData,
            canImportData: this.canImportData,
            canIncorporateClient: this.canIncorporateClient,
            canUpdateClient: this.canUpdateClient,
            canDesincorporateClient: this.canDesincorporateClient,
            canSearchClient: this.canSearchClient,
            canAddPayment: this.canAddPayment,
            canUpdatePayment: this.canUpdatePayment,
            canRemovePayment: this.canRemovePayment,
            canSearchPayment: this.canSearchPayment,
            canUpdateUserRoles: this.canUpdateUserRoles
        }
    }

    
    //-Columnas
    //+Lláves Foráneas
    //-Lláves Foráneas
}