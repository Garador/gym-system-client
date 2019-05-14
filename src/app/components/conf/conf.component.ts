import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfigurationService } from '../../libs/services/configuration/configuration.service';
import { Configuration } from '../../libs/models/Configuration';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { LoadingService } from '../../libs/services/loading/loading.service';
import { NotificationService } from '../../libs/services/notification/notification.service';

@Component({
  selector: 'app-conf',
  templateUrl: './conf.component.html',
  styleUrls: ['./conf.component.scss']
})
export class ConfComponent implements OnInit {

  public _configuration:Configuration;
  private _dataForm: FormGroup;

  constructor(
    public configurationService:ConfigurationService,
    public ref: ChangeDetectorRef,
    public loadingService:LoadingService,
    public notificationService:NotificationService
  ) {
    this._dataForm = new FormGroup({
      socketHost: new FormControl('',[
        (control: AbstractControl)=>{
          return (control.value && control.value.length>3) ? null : {invalidHost:true};
        }
      ]),
      socketPort: new FormControl('',[
        (control:AbstractControl)=>{
          return (control.value && parseInt(control.value)>0) ? null : {invalidPort:true};
        }
      ])
    });
  }

  public async save(){
    this._configuration.socketPort = parseInt(this._dataForm.controls['socketPort'].value);
    this._configuration.socketHost = this._dataForm.controls['socketHost'].value;

    let newConf:Configuration;
    
    try{
      newConf = await this.configurationService.saveConfiguration(this._configuration);
    }catch(e){
      console.log(e);
    }
    if(newConf){
      this.notificationService.showConfigurationUpdateMessage(1);
    }else{
      this.notificationService.showConfigurationUpdateMessage(0);
    }
  }

  public setForm(){
    if(!this._configuration){
      return;
    }
    this._dataForm.reset();
    this._dataForm.controls['socketHost'].setValue(this._configuration.socketHost);
    this._dataForm.controls['socketPort'].setValue(this._configuration.socketPort);
  }

  ngOnInit() {
    this.loadConfiguration();
  }

  async loadConfiguration(){
    this._configuration = await this.configurationService.getConfiguration();
    this.setForm();
    this.ref.detectChanges()
  }

}
