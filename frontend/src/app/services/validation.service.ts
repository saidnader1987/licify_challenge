import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { cleanNumberInputMask } from '../utils/clearNumberInputMask';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  validatePasswordConfirm(form: FormGroup): ValidationErrors | null {
    const password = form.get('password');
    const passwordConfirm = form.get('passwordConfirm');
    return password &&
      passwordConfirm &&
      password.value === passwordConfirm.value
      ? null
      : { noMatch: true };
  }

  validateEmail(control: FormControl): ValidationErrors | null {
    if (!control.value) return null;
    const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return !pattern.test(control.value) ? { invalidEmail: true } : null;
  }

  validateAtLeastOneNumber(control: FormControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    if (!/[0-9]/.test(value)) {
      return { noNumber: true };
    }
    return null;
  }

  validateAtLeastOneLowerCase(control: FormControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    if (!/[a-z]/.test(value)) {
      return { noLower: true };
    }
    return null;
  }

  validateAtLeastOneUpperCase(control: FormControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    if (!/[A-Z]/.test(value)) {
      return { noUpper: true };
    }
    return null;
  }

  validateAtLeastOneSpecialChar(control: FormControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const specialChars = /[.,€@_!#$%^&*()<>?/\|}{~:]/;
    if (!specialChars.test(value)) {
      return { noSpecial: true };
    }
    return null;
  }

  validateDateRange(form: FormGroup): ValidationErrors | null {
    const startDate = form.get('startDate');
    const endDate = form.get('endDate');
    if (!startDate || !endDate || !startDate.value || !endDate.value) {
      return null;
    }

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    if (start >= end) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  validateGreaterThanZero(control: FormControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const cleanedValue = cleanNumberInputMask(value);

    if (isNaN(cleanedValue) || cleanedValue <= 0) {
      return { invalidPositiveNumber: true };
    }

    return null;
  }

  validDate(control: FormControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    if (/^\d+$/.test(value)) {
      return { invalidDate: true };
    }

    const date = new Date(value);
    const isValidDate = !isNaN(date.getTime());

    return isValidDate ? null : { invalidDate: true };
  }
}
