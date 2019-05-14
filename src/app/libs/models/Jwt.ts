import {Entity, PrimaryColumn, Column, OneToOne, JoinColumn} from 'typeorm/browser';
import {TableNames} from '../enums/Database';
//import {User} from './User';
import {ITableMetadata} from '../interfaces/TableStructure';
import { toJson } from "../interfaces/Socket";
import { ITokenInterface } from '../interfaces/PasswordManager';
import { Role } from './Role';

@Entity({
    name:TableNames.Jwt.table_name
})
export class Jwt implements ITableMetadata {

    //+Metadata
    @PrimaryColumn({
        name:TableNames.Jwt.id
    })
    id: number;

    @Column({
        name:TableNames.Jwt.createdAt
    })
    createdAt: Date;

    @Column({
        name:TableNames.Jwt.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Jwt.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.Jwt.token,
        nullable: true
    })
    token: string;
    
    @Column({
        name:TableNames.Jwt.expireAt,
        nullable: true
    })
    expireAt: Date;
    //-Columnas

    //+ForeigKeys
    @Column({
        name:TableNames.Jwt.foreign_key_user,
        nullable: true
    })
    user: number;


    fromJson(json: toJson.IJwt){
        this.id = json.id;
        this.updatedAt = json.updatedAt;
        this.createdAt = json.createdAt;
        this.status = json.status;
        this.token = json.token;
        this.user = (!isNaN(<number><any>json.user)) ? <number>json.user : (()=>{
            if(json.user != null && json.user != undefined){
                if(!isNaN((<toJson.IUser>(<any>(json.user))).id)){
                    return ((<toJson.IUser><any>(json.user))).id;
                }else{
                    return null;
                }
            }else{
                return null;
            }
        })();;
    }


    toJson(): toJson.IJwt{
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            token: this.token,
            user:  this.user
        }
    }
}