import { Component, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Tab } from 'bootstrap';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { Register } from '../../types/register';
import { RegisterService } from '../../services/register.service';
import { ToastsComponent } from "../toasts/toasts.component";

@Component({
  selector: 'app-reg-auth-modal',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, ToastsComponent],
  templateUrl: './reg-auth-modal.component.html',
  styleUrls: ['./reg-auth-modal.component.scss'],
  providers: [provideNgxMask()]
})
export class RegistrationAndAuthorizationModalComponent {
  faCircleExclamation = faCircleExclamation;
  registerForm: FormGroup;
  loginForm: FormGroup;

  @ViewChild(ToastsComponent) toastComponent!: ToastsComponent;

  constructor(private registerService: RegisterService) {
    this.registerForm = new FormGroup({
      name: new FormControl('Данил', [Validators.required, this.nameValidator()]),
      email: new FormControl('fjaf@sdada.com', [Validators.required, Validators.email]),
      phone: new FormControl('+7 (094) 687-21-56', [Validators.required, this.phoneValidator()]),
      password: new FormControl('555rtp', [Validators.required, Validators.minLength(6), Validators.maxLength(20), this.passwordValidator()]),
      confirmPassword: new FormControl('555rtp', [Validators.required]),
      dataProcessingAgreement: new FormControl(false, Validators.requiredTrue)
    }, { validators: this.passwordMatchValidator });

    this.loginForm = new FormGroup({
      loginEmail: new FormControl('', [Validators.required, Validators.email]),
      loginPassword: new FormControl('', [Validators.required])
    });
  }

  showRegister(): void {
    const tabTrigger = document.querySelector('#register-tab') as HTMLElement;
    const tab = new Tab(tabTrigger);
    tab.show();
  }

  showLogin(): void {
    const tabTrigger = document.querySelector('#login-tab') as HTMLElement;
    const tab = new Tab(tabTrigger);
    tab.show();
  }

  nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      if (!value) {
        return null; 
      }
      // Проверка на первый пробел
      if (value.startsWith(' ')) {
        return { leadingWhitespace: true };
      }
      const valid = /^[а-яА-ЯёЁ\s-]+$/.test(value);
      return valid ? null : { pattern: true };
    };
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (/^\d+$/.test(value)) {
        return { onlyDigits: true };
      }
      return null;
    };
  }

  passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      form.get('confirmPassword')?.setErrors(null);
      return null;
    }
  };

  onPhoneFocus(): void {
    const phoneControl = this.registerForm.get('phone');
    if (phoneControl && !phoneControl.value) {
      phoneControl.setValue('+7');
    }
  }

  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
      return phoneRegex.test(value) ? null : { invalidPhone: true };
    };
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value && !input.value.startsWith('+7')) {
      input.value = '+7' + input.value.slice(1);
    }
    this.registerForm.get('phone')?.setValue(input.value, { emitEvent: false });
  }

  onPhoneBlur(): void {
    const phoneControl = this.registerForm.get('phone');
    if (phoneControl) {
      phoneControl.markAsTouched();
    }
  }

  onSubmitRegister() {
    this.registerForm.patchValue({
      name: this.registerForm.get('name')!.value.trim()
    });

    if (this.registerForm.valid) {
      const registerData: Register = {
        Name: this.registerForm.get('name')!.value,
        Email: this.registerForm.get('email')!.value,
        Phone: this.registerForm.get('phone')!.value,
        Password: this.registerForm.get('password')!.value,
        ConfirmPassword: this.registerForm.get('confirmPassword')!.value
      };
      this.registerService.register(registerData, this.toastComponent);
    }
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      console.log('Form Data:', this.loginForm.value);
    } else {
      console.log('Form is not valid.');
    }
  }
}
