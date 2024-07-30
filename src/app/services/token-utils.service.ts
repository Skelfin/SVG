import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export function isTokenExpired(token: string): boolean {
  const decodedToken: any = jwtDecode(token);
  const expiryTime = decodedToken.exp * 1000;
  return Date.now() >= expiryTime;
}

export function handleTokenExpiration(toastr: ToastrService, router: Router): void {
  localStorage.removeItem('jwtToken');
  router.navigate(['/']);
  toastr.error('Срок действия токена истек. Пожалуйста, войдите снова.', 'Ошибка');
}
