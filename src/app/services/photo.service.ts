import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants/constants';
import { MainPhoto } from '../types/photo';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(private http: HttpClient) {}

  private getPhotosUrl = `${API_URL}/get_photos.php`;

  getPhotos(lastId: number) {
    return this.http.get<MainPhoto[]>(`${this.getPhotosUrl}?lastId=${lastId}`);
  }
}