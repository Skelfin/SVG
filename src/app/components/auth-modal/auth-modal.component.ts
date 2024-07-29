import { Component } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss'
})
export class AuthComponent {
  faCircleExclamation = faCircleExclamation;
  loginForm: FormGroup;

  constructor(private registerService: RegisterService) {

    this.loginForm = new FormGroup({
      loginEmail: new FormControl('', [Validators.required, Validators.email]),
      loginPassword: new FormControl('', [Validators.required])
    });
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      const credentials = {
        Email: this.loginForm.get('loginEmail')!.value,
        Password: this.loginForm.get('loginPassword')!.value
      };
      this.registerService.login(credentials);
    }
  }

}
