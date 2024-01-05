import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName][currencyMaskWithDecimals]',
  standalone: true,
})
export class CurrencyMaskWithDecimalsDirective {
  @Input() maxDecimals: number = 2;

  constructor(public ngControl: NgControl, private el: ElementRef) {}

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event: any) {
    this.onInputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event: any) {
    this.onInputChange(event.target.value, true);
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent) {
    const value = this.ngControl.value;

    if (!value || value === '$') {
      this.ngControl.control?.setValue('$0.00');
    } else {
      const num = parseFloat(value.replace('$', '').replace(/,/g, ''));
      if (!isNaN(num)) {
        const formattedValue =
          '$' +
          num.toFixed(this.maxDecimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        this.ngControl.control?.setValue(formattedValue);
      }
    }
  }

  onInputChange(event: any, backspace: boolean) {
    // Store cursor position and old value for future cursor adjustment
    const cursorPosition = this.el.nativeElement.selectionStart;
    const oldVal = this.ngControl.value;

    // If the user deletes everything, don't intervene. Let it be.
    if (event === '') return;

    let newVal = event.replace(/[^0-9.]*/g, '');

    // If the newVal becomes empty after cleanup or is just `$` after backspace, return early to avoid further processing
    if (
      newVal === '' ||
      newVal === '$' ||
      (backspace && (newVal === '' || newVal === '$'))
    ) {
      return;
    }

    // Extracting the decimal part if any
    const parts = newVal.split('.');
    parts[0] = parts[0].replace(/^0+/, '') || '0';
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts[1] && parts[1].length > this.maxDecimals) {
      parts[1] = parts[1].substring(0, this.maxDecimals);
    }
    newVal = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
    newVal = newVal.length === 0 ? '' : '$' + newVal;

    // Update the view
    this.ngControl.valueAccessor?.writeValue(newVal);

    // Calculate the adjustment that needs to be made to the cursor
    const adjustment = this.calculateCursorAdjustment(
      oldVal,
      newVal,
      cursorPosition
    );

    // Wait for Angular to finish its updates before placing the cursor
    setTimeout(() => {
      this.el.nativeElement.setSelectionRange(
        cursorPosition + adjustment,
        cursorPosition + adjustment
      );
    }, 0);
  }

  calculateCursorAdjustment(
    oldVal: string,
    newVal: string,
    cursorPosition: number
  ): number {
    // Get substrings until cursor for the value before and after formating
    const oldLeft = oldVal.substring(0, cursorPosition);
    const newLeft = newVal.substring(0, cursorPosition);

    // Get # of non numeric characters of each substring
    const nonNumericOld = oldLeft.replace(/[0-9.]/g, '').length;
    const nonNumericNew = newLeft.replace(/[0-9.]/g, '').length;

    // Get the difference of # of non numeric characters (aka '$,')
    return nonNumericNew - nonNumericOld;
  }
}
