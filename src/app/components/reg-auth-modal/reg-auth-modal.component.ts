import { Component } from '@angular/core';
import { Tab } from 'bootstrap';

@Component({
  selector: 'app-reg-auth-modal',
  standalone: true,
  imports: [],
  templateUrl: './reg-auth-modal.component.html',
  styleUrl: './reg-auth-modal.component.scss'
})
export class RegistrationAndAuthorizationModalComponent {
  
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
}
