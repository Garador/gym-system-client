import {
  Component,
  OnInit,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import {
  toJson
} from '../../libs/interfaces/Socket';
import {
  LogActions
} from '../../libs/enums/Log';
import {
  TableNames
} from '../../libs/enums/Database';
import * as moment from 'moment';
import { SyntaxValidationProvider } from '../../libs/providers/SyntaxValidationProvider';
import { UserService } from '../../libs/services/user/user.service';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-log-content-details',
  templateUrl: './log-content-details.component.html',
  styleUrls: ['./log-content-details.component.scss']
})
export class LogContentDetailsComponent implements OnInit, AfterViewInit {

  private _log: toJson.ILog;

  public LogActions = LogActions;

  public LABELS = {
    membership: {
      _title: "Membresía",
      cutDate: "Fecha de Corte"
    },
    user: {
      _title: "Usuario",
      id: 'ID',
      name: "nombre",
      surname: "apellido",
      createdAt: "creado",
      updatedAt: "actualizado",
      status: "status",
      loggedin: "loggedin",
      phone: "telefono",
      address: "direccion",
      foreign_key_role: 'rol',
      foreign_key_document: 'documento',
      foreign_key_user: 'usuario',
      foreign_key_jwt: 'jwt',
      foreign_key_membership: 'membresia',
      foreign_key_login: "login"
    },
    document: {
      _title: "Documento",
      id: "documento",
      prefix: "prefijo",
      content: "contenido",
      image: "imagen",
      createdAt: "creado",
      updatedAt: "actualizado",
      status: "status",
      foreign_key_user: "usuario"
    }
  }

  constructor(public userService:UserService, 
    public ref: ChangeDetectorRef,
    public ngZone:NgZone) {
    Object.keys(TableNames).forEach((key: string) => {
      if ( < any > TableNames[key].table_name) {
      } else {
        console.log("No table_name field found on: ", key);
      }
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.ngZone.run(()=>{
      this.ref.detectChanges();
    });
  }

  getParsedDate(date:any){
    return moment(date).lang('es').format("DD/MM/YYYY");
  }

  getParsedAmmount(ammount){
    return SyntaxValidationProvider.Instance.integerToFloat(ammount, 2);
  }

  public set log(log: toJson.ILog) {
    log.content.newValue = <any>this.inflateString(log.content.newValue);
    log.content.previousValue = <any>this.inflateString(log.content.previousValue);
    this._log = log;
  }

  public async viewClientDetails(userID: any){
    console.log("Searching client by id:", userID);
    let user = (await this.userService.fetchClientByID(userID, ['membership','document']))[0];
    console.log("Client loaded: ",user);
    AppComponent.mainNavBar.viewClientDetails(user);
  }

  public inflateString(data:string):Object{
    return JSON.parse(data);
  }

  public get log() {
    return this._log;
  }

}
