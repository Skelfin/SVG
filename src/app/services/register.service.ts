import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants/constants';
import { Register } from '../types/register';
import { ToastsComponent } from '../components/toasts/toasts.component';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private registerUrl = `${API_URL}/register.php`;
  private loginUrl = `${API_URL}/login.php`;

  constructor(private http: HttpClient, private readonly router: Router) { }

  register(userData: Register, toastComponent: ToastsComponent) {
    return this.http.post<{ status: string; message: string; user?: { name: string; email: string } }>(this.registerUrl, userData)
    .subscribe(response => {
        if (response.status === 'success') {
          toastComponent.showSuccessToast(response.message);
          this.router.navigate(['/']);
        } else {
          toastComponent.showErrorToast(response.message);
        }
      });
    }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials);
  }
}
