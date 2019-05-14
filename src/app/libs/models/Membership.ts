//import { User } from './User';
import {
    ITableMetadata
} from '../interfaces/TableStructure';
//import { Company } from './Company';
import {
    Payment
} from './Payment';
import {
    TableNames
} from '../enums/Database';
import { toJson } from "../interfaces/Socket";
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm/browser';

@Entity({
    name: TableNames.Membership.table_name
})
export class Membership implements ITableMetadata {

    //+Metadata
    @PrimaryColumn({
        name: TableNames.Membership.id
    })
    id: number;

    @Column({
        name: TableNames.Membership.createdAt
    })
    createdAt: Date;

    @Column({
        name: TableNames.Membership.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Membership.status
    })
    status: number;
    //-Metadata

    //+Columnas
    @Column({
        name: TableNames.Membership.cut_date,
        nullable: true
    })
    cutDate: Date;

    @Column({
        name: TableNames.Membership.inscription_date,
        nullable: true
    })
    inscriptionDate: Date;
    //-Columnas

    //+Llaves Foraneas
    /*@ManyToOne(type => Company, company => company.memberships)
    @JoinColumn({
        name: TableNames.Membership.foreign_key_company
    })
    */
    @Column({
        name: TableNames.Membership.foreign_key_company
    })
    company: number;

    /*@OneToOne(type => User, user => user.membership)
    @JoinColumn({
        name: TableNames.Membership.foreign_key_user
    })
    */
    @Column({
        name: TableNames.Membership.foreign_key_user
    })
    user: number;
    //-Llaves Foraneas

    //+Relaciones    
    payments: number[];

    toJson(): toJson.IMembership{
        return <toJson.IMembership> {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status,
            cutDate: this.cutDate,
            inscriptionDate: this.inscriptionDate,
            company: this.company,
            user: this.user
        }
    }

    public async loadPayments(paging?:{skip?:number, take?:number}) {
    }

    public static async addPayment(payment: Payment, membership:Membership) {
    }



}