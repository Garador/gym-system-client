import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, AfterUpdate, UpdateDateColumn } from "typeorm/browser";
import {ITableMetadata} from '../interfaces/TableStructure';
import {TableNames, DATABASE_MODEL_EVENTS} from '../enums/Database';
import { Subject } from 'rxjs';
export enum EPaymentType {
    EFECTIVO = 0,
    TRANSFERENCIA = 1
}

@Entity({
    name: TableNames.Configuration.table_name
})
export class Configuration implements ITableMetadata {
    public subject = new Subject<DATABASE_MODEL_EVENTS>();
    
    //+Metadata
    @PrimaryGeneratedColumn({                    //DICATADA POR ABREVIATURA iso_4217
        name: TableNames.Configuration.id
    })
    id: string;

    @CreateDateColumn({
        name: TableNames.Configuration.createdAt
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: TableNames.Configuration.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Configuration.status
        ,default: 1
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Configuration.socket_host
    })
    socketHost: string;

    @Column({
        name: TableNames.Configuration.socket_port
    })
    socketPort: number;

    //-Columnas

    @AfterUpdate()
    callListeners(){
        this.subject.next(DATABASE_MODEL_EVENTS.MODEL_UPDATED);
    }

}