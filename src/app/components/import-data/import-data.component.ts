import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { BackupService } from '../../libs/services/backup/backup.service';
import { IFileUploadResult } from '../../libs/interfaces/ExportManager';
import { LoadingService } from '../../libs/services/loading/loading.service';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss']
})
export class ImportDataComponent implements OnInit {
  bar: HTMLElement;
  @ViewChild('FileBox')
  fileElement:HTMLInputElement;

  constructor(
    public exportManager:BackupService,
    public ref:ChangeDetectorRef,
    public loadingService: LoadingService
  ) {}

  ngOnInit() {
    //this.bar = document.getElementById('js-progressbar');
  }

  ngAfterViewInit(){
    this.fileElement['nativeElement'].onchange = ()=>{
      if(this.file && this.file.name && !/^[\w]+(.zip)$/.test(this.file.name)){
        //File not valid. Remove it.
        console.log("File not valid. Removing it...");
        this.fileElement['nativeElement'].value = "";
        console.log("Current file: ",this.file);
      }
      this.ref.detectChanges();
    }
  }

  public canUpload(){
    return !!(this.file);
  }

  public get fileSize(): string{
    if(this.file){
      return `${Math.floor((this.file.size/1024))} KB`;
    }
    return `0`;;
  }

  public get file(){
    if((<Array<File>>this.fileElement['nativeElement'].files).length>0){
      return (<Array<File>>this.fileElement['nativeElement'].files)[0];
    }else{
      return null;
    }
  }



  async import(){
    let result:IFileUploadResult;
    if((<Array<File>>this.fileElement['nativeElement'].files).length>0){
      this.loadingService.displayBasicLoading();
      result = await this.exportManager.importFile((<Array<File>>this.fileElement['nativeElement'].files)[0]);
      this.loadingService.hideBasicLoading();
    }else{
      console.log("No files read...");
    }
  }

}
