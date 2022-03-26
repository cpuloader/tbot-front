import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: 'input[numbersOnly]'
})
export class NumbersOnlyInputDirective {

    constructor(private elRef: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event: any) {
        const initalValue = this.elRef.nativeElement.value;
        this.elRef.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
        if ( initalValue !== this.elRef.nativeElement.value) {
            event.stopPropagation();
        }
    }

}
