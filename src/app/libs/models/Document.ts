//import {User} from './User';
import {TableNames} from '../enums/Database';
import {ITableMetadata} from '../interfaces/TableStructure';
import { toJson } from "../interfaces/Socket";
import { Entity, UpdateDateColumn, JoinColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity({
    name: TableNames.Document.table_name
})
export class Document implements ITableMetadata {

    //+Metadata
    @PrimaryColumn({
        name:TableNames.Document.id
    })
    id: number;

    @Column({
        name:TableNames.Document.createdAt
    })
    createdAt: Date;

    @Column({
        name:TableNames.Document.updatedAt
    })
    updatedAt: Date;

    @Column({
        name:TableNames.Document.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name:TableNames.Document.prefix,
        length:4
    })
    prefix: string;

    @Column({
        name:TableNames.Document.content,
        length:60
    })
    content: string;

    @Column({
        name:TableNames.Document.image,
        nullable: true
    })
    image: string;
    //-Columnas

    //+Lláves Foráneas
    /**/
    //@OneToOne(type => User, user => user.document)
    //@JoinColumn({ name: TableNames.Document.foreign_key_user })
    @Column({
        name:TableNames.Document.foreign_key_user,
        nullable: true
    })
    user: number;

    toJson(): toJson.IDocument{
        return <toJson.IDocument>{
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            prefix: this.prefix,
            content: this.content,
            image: this.image,
            user: this.user
        }
    }

}