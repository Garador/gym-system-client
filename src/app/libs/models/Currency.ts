import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm/browser";
import {ITableMetadata} from '../interfaces/TableStructure';
import {TableNames} from '../enums/Database';
//import { Payment } from "./Payment";
import { toJson } from "../interfaces/Socket";
import { DatabaseService } from '../providers/DatabaseProvider';
export enum EPaymentType {
    EFECTIVO = 0,
    TRANSFERENCIA = 1
}


@Entity({
    name: TableNames.Currency.table_name
})
export class Currency implements ITableMetadata {
    
    //+Metadata
    @PrimaryColumn({                    //DICATADA POR ABREVIATURA iso_4217
        name: TableNames.Currency.id
    })
    id: string;

    @Column({
        name: TableNames.Currency.createdAt
    })
    createdAt: Date;

    @Column({
        name: TableNames.Currency.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Currency.status
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Currency.iso_4217
    })
    isoCode: number;

    @Column({
        name: TableNames.Currency.decimals
    })
    decimals: number;

    @Column({
        name: TableNames.Currency.display_name
    })
    displayName: string;
    //-Columnas


    //+Llaves Foraneas
    /*@OneToMany(type => Payment, payment => payment.currency)
    */
    payments: number[];
    //-Llaves Foraneas
    
    public fromJson(obj:toJson.ICurrency){
        this.id = obj.id;
        this.createdAt = obj.createdAt;
        this.updatedAt = obj.updatedAt;
        this.status = obj.status;
        this.isoCode = obj.isoCode;
        this.decimals = obj.decimals;
        this.displayName = obj.displayName;
    }

    public toJson():toJson.ICurrency{
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            isoCode: this.isoCode,
            decimals: this.decimals,
            displayName: this.displayName,
            payments: this.payments
        }
    }

}