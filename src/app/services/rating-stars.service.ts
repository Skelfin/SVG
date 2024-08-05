import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { handleTokenExpiration, isTokenExpired } from './token-utils.service';
import { API_URL } from '../constants/constants';
import { RatePhotoParams } from '../types/rating';

interface RatePhotoResponse {
  status: string;
  message: string;
  newRating: number;
  newNumberOfRatings: number;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoRatingService {
  private ratePhotoUrl = `${API_URL}/rate_photo`;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ratePhoto({ photoId, rating, onComplete }: RatePhotoParams) {
    const token = localStorage.getItem('jwtToken');
    if (token && isTokenExpired(token)) {
      handleTokenExpiration(this.toastr, this.router);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const payload = {
      photo_id: photoId,
      rating: rating,
    };

    return this.http
      .post<RatePhotoResponse>(this.ratePhotoUrl, payload, { headers })
      .subscribe((response) => {
        if (response.status === 'success') {
          onComplete(response.newRating, response.newNumberOfRatings);
        } else {
          this.toastr.error(response.message, 'Ошибка');
        }
      });
  }
}