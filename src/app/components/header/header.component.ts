import { Component } from '@angular/core';
import { RegistrationAndAuthorizationModalComponent } from '../reg-auth-modal/reg-auth-modal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RegistrationAndAuthorizationModalComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
