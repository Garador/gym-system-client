import { Pipe, PipeTransform, NgZone } from '@angular/core';
import { SyntaxValidationProvider } from '../libs/providers/SyntaxValidationProvider';
import { AbstractControl } from '@angular/forms';

@Pipe({
  name: 'documentFormatPipe'
})
export class DocumentFormatPipePipe implements PipeTransform {

  constructor(public ngZone:NgZone){

  }

  transform(value: any, docPrefix: any, component?:AbstractControl): any {
    if(!value || value.length<2) return value;
    let newValue = SyntaxValidationProvider.normalizeDocumentContentFunctions[docPrefix](value);
    //component.setValue(newValue);
    return newValue;
    //[value]="_loginForm.controls.username.value | documentFormatPipe:'CI'"
    //component.setValue(newValue);
  }

}
