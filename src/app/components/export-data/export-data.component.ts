import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { BackupService } from '../../libs/services/backup/backup.service';
import { USER_SERVICE_EVENTS } from '../../libs/enums/User';
import { NotificationService } from '../../libs/services/notification/notification.service';
import { DialogMessages } from '../../libs/enums/UserMessages';
import { LoadingService } from '../../libs/services/loading/loading.service';

@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent implements OnInit {

  dumpFileList:string[] = [];

  constructor(
    public backupService:BackupService,
    private ref: ChangeDetectorRef,
    public notificationService: NotificationService,
    public loadingService: LoadingService,
    public ngZone: NgZone
  ) {

  }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    this.loadFileList();
  }

  async loadFileList(){
    if(!this.backupService.userService.personalProfile){
      await new Promise((accept)=>{
        let sub = this.backupService.userService.subject.subscribe((payload)=>{
          if(payload.event === USER_SERVICE_EVENTS.PROFILE_LOADED){
            sub.unsubscribe();
            accept();
          }
        })
      });
    }
    this.dumpFileList = await this.backupService.getFileList();
    try{
      this.ref.detectChanges();
    }catch(e){

    }
  }

  async generateExport(){
    this.loadingService.displayBasicLoading();
    let backupFile = await this.backupService.generateExport();
    this.loadingService.hideBasicLoading();
    if(backupFile){
      this.loadFileList();
      setTimeout(()=>{
        this.ngZone.run(()=>{
          this.downloadfile(this.backupService.getFileName(backupFile));
        });
      },500)
    }
  }
  

  async downloadfile(filename:string){
    window.open(`http://localhost:8036/downloadBackup/${filename}`, '_parent');
  }

  async removeFile(filename:string){
    let confirmed = await this.notificationService.confirmDialog(DialogMessages.REMOVE_BACKUP.CONFIRM.replace('${1}',filename), <any>{stack: true, labels: {"ok": "Si", "cancel":"No"}});
    if(!confirmed){
      return;
    }
    let removeResponse = await this.backupService.removeFile(filename);
    if(typeof(removeResponse) === "boolean" && removeResponse){
      this.notificationService.alert(DialogMessages.REMOVE_BACKUP.REMOVE_SUCCESS, <any>{stack:true});
      this.loadFileList();
    }else{
      this.notificationService.alert(DialogMessages.REMOVE_BACKUP.REMOVE_ERROR, <any>{stack:true});
    }
  }

}
