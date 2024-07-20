import { Component } from '@angular/core';
import { RegistrationAndAuthorizationModalComponent } from '../reg-auth-modal/reg-auth-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RegistrationAndAuthorizationModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
