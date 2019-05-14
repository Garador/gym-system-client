import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import {ITableMetadata} from '../interfaces/TableStructure';
import { User } from "./User";
import { TableNames } from '../enums/Database';

@Entity({
    name: TableNames.UserContact.table_name
})
export class UserContact implements ITableMetadata {
    
    //+Metadata
    @PrimaryColumn({
        name: TableNames.UserContact.id
    })
    id: number;

    @Column({
        name: TableNames.UserContact.createdAt
    })
    createdAt: Date;

    @Column({
        name: TableNames.UserContact.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.UserContact.status,
        type:'integer'
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.UserContact.content
    })
    content: string;

    @Column({
        name: TableNames.UserContact.type
    })
    contactType: number;       //Dictado por Enums.
    //-Columnas

    //+Llaves Foraneas
    //-Llaves Foraneas

    //Relaciones sin llaves foráneas
    //@ManyToOne(type => User, user => user.contacts)
    /*@JoinColumn({
        name: TableNames.UserContact.foreign_key_user
    })*/
    @Column({
        name: TableNames.UserContact.foreign_key_user
    })
    user: User;
    //-Relaciones

}