import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'jqueryDatePickerPipe'
})
export class JqueryUpdatePipe implements PipeTransform {
  static initializedIDs:Array<string> = [];
  initialized:boolean;

  transform(value: any, inputID: string, control:AbstractControl): any {
    (<any>$(`#${inputID}`)).datepicker({
      onSelect: (dateText, inst) => {
        console.log(`DatePicker chosen for #${inputID}. Date: ${dateText} // inst: `,inst);
        control.setValue(dateText);
      }
    });
    return value;
  }

}
