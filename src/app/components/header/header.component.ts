import { Component } from '@angular/core';
import { RegistrationModalComponent } from '../reg-modal/reg-modal.component';
import { RouterLink } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RegistrationModalComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isAuthenticated = false;
  userName: string | null = null;

  constructor(private registerService: RegisterService) {}

  ngOnInit(): void {
    this.checkAuthentication();
  }

  checkAuthentication(): void {
    this.isAuthenticated = this.registerService.isAuthenticated();
    if (this.isAuthenticated) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const decodedToken: any = jwtDecode(token);
        this.userName = decodedToken.name;
      }
    }
  }

  logout(): void {
    this.registerService.logout();
    this.isAuthenticated = false;
    this.userName = null;
  }
}