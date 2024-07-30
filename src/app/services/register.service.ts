import { Injectable, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants/constants';
import { Register, Login } from '../types/register';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Status } from '../types/status';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private registerUrl = `${API_URL}/register.php`;
  private loginUrl = `${API_URL}/login.php`;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private readonly router: Router, private toastr: ToastrService) {}

  register(userData: Register) {
    return this.http.post<Status>(this.registerUrl, userData)
    .subscribe(response => {
        if (response.status === 'success' && response.token) {
          localStorage.setItem('jwtToken', response.token);
          this.isAuthenticatedSubject.next(true);
          window.location.reload();
          this.router.navigate(['/']);
        } else {
          this.toastr.error(response.message, 'Ошибка');
        }
      });
  }

  login(credentials: Login) {
    return this.http.post<Status>(this.loginUrl, credentials)
    .subscribe(response => {
        if (response.status === 'success' && response.token) {
          localStorage.setItem('jwtToken', response.token);
          this.isAuthenticatedSubject.next(true);
          window.location.reload();
          this.router.navigate(['/']);
        } else {
          this.toastr.error(response.message, 'Ошибка');
        }
      });
  }

  logout() {
    localStorage.removeItem('jwtToken');
    this.isAuthenticatedSubject.next(false);
    this.toastr.success('Вы успешно вышли', 'Успех');
    this.router.navigate(['']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwtToken');
  }
}
