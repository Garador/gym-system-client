import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
declare const datepicker:any;

@Component({
  selector: 'tcc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public static mainNavBar: NavbarComponent;
  @ViewChild('mainNavBar') private _mainNavBarB: NavbarComponent;
  private themeWrapper = document.querySelector('body');
   

  ngOnInit(): void {
    this.initDatePicker();
  }

  private initModel(): void {

  }

  private initDatePicker(){
    (<any>$).datepicker.regional['es'] = {
    closeText: 'Cerrar',
    prevText: '< Ant',
    nextText: 'Sig >',
    currentText: 'Hoy',
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
    dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
    weekHeader: 'Sm',
    dateFormat: 'dd/mm/yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
    };
    (<any>$).datepicker.setDefaults((<any>$).datepicker.regional['es']);
  }

  ngAfterViewInit(){
    AppComponent.mainNavBar = this._mainNavBarB;
    this.setTheme();
  }


  setTheme(){
    //this.themeWrapper.style.setProperty('--button-primary-background', "RED");
    //this.themeWrapper.style.setProperty('--button-primary-color', "WHITE");
  }
}
