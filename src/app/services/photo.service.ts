import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants/constants';
import { Photo } from '../types/photo';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  constructor(private http: HttpClient) {}

  private getPhotosUrl = `${API_URL}/get_photos.php`;

  getPhotos(lastId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.getPhotosUrl}?lastId=${lastId}`);
  }
}