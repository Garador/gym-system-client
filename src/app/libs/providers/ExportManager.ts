import { IExportResult, IImportResult } from '../interfaces/ExportManager';

export class ExportManager {

    private static _instance:ExportManager;

    constructor(){

    }

    public static get Instance(){
        ExportManager._instance = (ExportManager._instance) ? ExportManager._instance : new ExportManager();
        return ExportManager._instance;
    }

    public async doImport(): Promise<IImportResult>{
        return null;
    }

    public async doExport(): Promise<IExportResult>{
        return null;
    }

    public getExportPaths(){
    }

}