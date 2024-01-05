import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[onlyNumbersAndDecimals]',
  standalone: true,
})
export class OnlyNumbersAndDecimalsDirective {
  @Input() maxDecimals: number = 2;

  @HostListener('keydown', ['$event'])
  public onKeyDown(e: KeyboardEvent) {
    const input: HTMLInputElement = e.target as HTMLInputElement;

    const isEntireValueSelected =
      input.selectionStart === 0 && input.selectionEnd === input.value.length;

    // Calculate the future value of the input based on the keypress and cursor position
    const cursorPosition = input.selectionStart!;
    const futureValue =
      e.key === 'Backspace'
        ? input.value.substring(0, input.value.length - 1)
        : input.value.slice(0, cursorPosition) +
          e.key +
          input.value.slice(cursorPosition);

    // Utility keys that should not be restricted
    const utilityKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Tab',
      'Shift',
      'Control',
      'Alt',
      'Delete',
      'Insert',
      'PageUp',
      'PageDown',
    ];

    if (utilityKeys.includes(e.key)) {
      return;
    }

    // Restrict anything that isn't a number or a dot
    if (
      !(e.key >= '0' && e.key <= '9') &&
      e.key !== '.' &&
      e.key !== 'Backspace'
    ) {
      e.preventDefault();
      return;
    }

    // Restrict more than one dot
    if (e.key === '.' && input.value.includes('.')) {
      e.preventDefault();
      return;
    }

    // Handle the situation where the input starts with a dot
    if (futureValue.charAt(0) === '.') {
      e.preventDefault();
      return;
    }

    // If future value has more than allowed decimals and the whole value is not selected
    if (!isEntireValueSelected) {
      const parts = futureValue.split('.');
      if (parts.length > 1 && parts[1].length > this.maxDecimals) {
        e.preventDefault();
      }
    }
  }

  @HostListener('focusout', ['$event'])
  public onFocusOut(e: FocusEvent) {
    const input: HTMLInputElement = e.target as HTMLInputElement;
    const value: string = input.value;

    if (value.endsWith('.')) {
      input.value = value.slice(0, -1);
    }
  }
}
