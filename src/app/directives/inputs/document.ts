import {Directive, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
    selector: '[document_ci]'
})
export class DocumentDirective {


    @Input() document_ci: AbstractControl;
    @Output() uppercaseChange: EventEmitter<AbstractControl> = new EventEmitter<AbstractControl>();

    constructor() {
    }

    ngOnInit() {
        //this.document_ci = this.document_ci || '';
        if(this.document_ci){
            this.document_ci.setValue("");
        }
        this.format(this.document_ci);
    }

    format(value) {
        console.log("Value gotten: ",value.value);
        value.value = (value.value.toUpperCase());
        this.uppercaseChange.next(value.value);
        /*
        if(typeof value === "string"){
            value = value.toUpperCase();
        }
        */
    }
}