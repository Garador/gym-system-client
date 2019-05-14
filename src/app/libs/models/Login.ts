//import {User} from './User';
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm/browser';
import { TableNames } from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import { toJson } from "../interfaces/Socket";

@Entity({
    name: TableNames.Login.table_name
})
export class Login implements ITableMetadata {
    
    //+Metadata
    @PrimaryColumn({
        name: TableNames.Login.id
    })
    id: number;

    @Column({
        name: TableNames.Login.createdAt
    })
    createdAt: Date;

    @Column({
        name: TableNames.Login.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Login.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Login.username,
        length: 20,
        unique: true
    })
    username: string;
    
    @Column({
        name: TableNames.Login.algorithm,
        length: 20
    })
    algorithm: string;
    //-Columnas

    //+Llaves Foraneas   
    @Column({
        name: TableNames.Login.foreign_key_user
    }) 
    user: number;

    toJson(): toJson.ILogin{
        return <toJson.ILogin>{
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            username: this.username,
            user: this.user
        }
    }



    /**
     * @param unprotectedPassword The password to protect
     * @description Salts the password and returns the produced salt.
     */
    public setPassword(unprotectedPassword: string): string{
        return null;
    }


    public hasPassword(rawPassword: string) : boolean {
        return null;
    }

}