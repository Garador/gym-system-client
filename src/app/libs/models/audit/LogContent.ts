import {ITableMetadata} from '../../interfaces/TableStructure';


export class LogContent implements ITableMetadata {

    //+Metadata
    id: number;

    logId: number;

    createdAt: Date;

    updatedAt: Date;

    status: number;
    //-Metadata
    
    //+Columnas
    previousValue: string;

    newValue: string;
    
    //-Columnas
    //+Lláves Foráneas
    //-Lláves Foráneas

}