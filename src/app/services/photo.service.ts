import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../constants/constants';
import { MainPhoto, Photo, UploadPhotoData } from '../types/photo';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Status } from '../types/status';
import { handleTokenExpiration, isTokenExpired } from './token-utils.service';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  constructor(private http: HttpClient, private readonly router: Router, private toastr: ToastrService) {}

  private getPhotosUrl = `${API_URL}/get_photos`;
  private getPhotoByIdUrl = `${API_URL}/get_photo`;
  private uploadUrl = `${API_URL}/upload_pic`;

  getPhotos(lastId: string) {
    const url = lastId ? `${this.getPhotosUrl}?lastId=${lastId}` : this.getPhotosUrl;
    return this.http.get<MainPhoto[]>(url);
  }

  getPhotoById(id: string) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.get<Photo>(`${this.getPhotoByIdUrl}?id=${id}`, { headers });
  }

  uploadPhoto(data: UploadPhotoData) {
    const token = localStorage.getItem('jwtToken');
    if (token && isTokenExpired(token)) {
      handleTokenExpiration(this.toastr, this.router);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${data.token}`
    });

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('image', data.image);

    return this.http.post<Status>(this.uploadUrl, formData, { headers })
    .subscribe((response) => {
      if (response.status === 'success') {
        this.toastr.success(response.message, 'Успех');
        this.router.navigate(['/']);
        data.onComplete();
      } else {
        this.toastr.error(response.message, 'Ошибка');
        data.onComplete();
      }
    });
  }
}
