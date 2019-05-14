import {ITableMetadata} from '../interfaces/TableStructure';
import {TableNames} from '../enums/Database';
import { Membership } from "./Membership";
import { ICompanyUpdatePayload, ICompanyUpdateResult } from "../interfaces/Company";
import { CompanyUpdateResult } from "../enums/Company";
import { toJson } from "../interfaces/Socket";
import { Entity, OneToOne, UpdateDateColumn, Column, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";

@Entity({
    name: TableNames.Company.table_name
})
export class Company implements ITableMetadata {
    
    //+Metadata
    //@PrimaryGeneratedColumn({
    @PrimaryColumn({
        name: TableNames.Company.id
    })
    id: number;

    @Column({
        name: TableNames.Company.createdAt
    })
    createdAt: Date;

    @Column({
        name: TableNames.Company.updatedAt
    })
    updatedAt: Date;

    @Column({
        name: TableNames.Company.status,
        type:'integer'
    })
    status: number;
    //-Metadata
    
    //+Columnas
    @Column({
        name: TableNames.Company.description
    })
    description: string;

    @Column({
        name: TableNames.Company.name
    })
    name: string;
    //-Columnas

    //+Llaves Foraneas
    //-Llaves Foraneas

    //Relaciones sin llaves foráneas
    //@OneToMany(type => Membership, membership => membership.company)
    memberships: number[];
    //-Relaciones

    public static async getBaseCompany(): Promise<Company> {
        return null;
    }

    public toJson(): toJson.ICompany{
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            status: this.status,
            description: this.description,
            name: this.name,
            memberships:this.memberships
        }
    }


    public async updateCompany(payload: ICompanyUpdatePayload): Promise < ICompanyUpdateResult > {
        return null;
    }

}