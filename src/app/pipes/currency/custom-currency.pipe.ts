import { Pipe, PipeTransform, NgZone } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { PaymentService } from '../../libs/services/payment/payment.service';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {

  constructor(public paymentService:PaymentService, public ngZone:NgZone){

  }

  transform(ammount: any, control:AbstractControl, decimals:number): any {

    let newValue:string = ammount;
    if(ammount){
      //console.log("CURRENT AMMOUNT: ",ammount);
      newValue = this.paymentService.integerToAmmount(ammount, decimals);
      //console.log('INTEGER TO AMMOUNT: ',newValue);
      let integerB = this.paymentService.ammountToInteger(newValue, decimals);
      //console.log("AMMOUNT TO INTEGER (of "+newValue+"): ",integerB);
      return ammount;
    }else{
      //console.log("Unknown Ammount: ",ammount);
    }
    return ammount;
  }

}
