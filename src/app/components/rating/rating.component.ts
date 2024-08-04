import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { PhotoRating } from '../../types/photo';
import { jwtDecode } from 'jwt-decode';
import { RegistrationModalComponent } from "../reg-modal/reg-modal.component";
import { CommonModule } from '@angular/common';
import { RegisterService } from '../../services/register.service';
import { PhotoRatingService } from '../../services/rating-stars.service';
import { RatingCountPipe } from "../../pipes/rating-count.pipe";

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [FontAwesomeModule, RegistrationModalComponent, CommonModule, RatingCountPipe],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent implements OnChanges, OnInit {
  faStar = faStar;
  stars: boolean[] = [false, false, false, false, false];
  selectedRating: number = 0;
  @Input() photo?: PhotoRating;
  isAuthor: boolean = false;
  isAuthenticated: boolean = false;
  userRating: number = 0;
  ratingSubmitted: boolean = false;
  submitting: boolean = false;
  isRatingSubmitting: boolean = false;

  constructor(
    private registerService: RegisterService,
    private photoRatingService: PhotoRatingService
  ) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photo'] && this.photo) {
  
      this.checkAuthor();
      if (this.photo.UserRating !== undefined && this.photo.UserRating >= 1 && this.photo.UserRating <= 5) {
        this.selectedRating = this.photo.UserRating;
        this.userRating = this.photo.UserRating;
        this.stars = this.stars.map((_, i) => i < this.selectedRating);
        this.ratingSubmitted = true;
      }
    }
  }
  ngOnInit(): void {
    this.isAuthenticated = this.registerService.isAuthenticated();
    this.registerService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  getUserIdFromToken(token: string): number {
    const decodedToken: any = jwtDecode(token);
    return decodedToken.ID;
  }

  checkAuthor(): void {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const userId = this.getUserIdFromToken(token);
      this.isAuthor = this.photo?.AuthorID === userId;
    }
  }

  hover(index: number): void {
    if (!this.isAuthor && !this.ratingSubmitted) {
      this.stars = this.stars.map((_, i) => i <= index || i < this.selectedRating);
    }
  }

  leave(): void {
    if (!this.isAuthor && !this.ratingSubmitted) {
      this.stars = this.stars.map((_, i) => i < this.selectedRating);
    }
  }

  rate(index: number): void {
    if (!this.isAuthor && !this.ratingSubmitted) {
      if (this.selectedRating === index + 1) {
        this.selectedRating = 0;
        this.stars = this.stars.map(() => false);
      } else {
        this.selectedRating = index + 1;
        this.stars = this.stars.map((_, i) => i < this.selectedRating);
      }
    }
  }

  submitRating(): void {
    if (!this.isAuthor && !this.ratingSubmitted && this.selectedRating !== this.userRating) {
      if (this.photo) {
        this.isRatingSubmitting = true;
        setTimeout(() => {
          this.photoRatingService.ratePhoto(this.photo!.ID, this.selectedRating, (newRating: number, newNumberOfRatings: number) => {
              this.isRatingSubmitting = false;
              this.ratingSubmitted = true;
              this.photo!.Rating = newRating;
              this.photo!.Number_of_ratings = newNumberOfRatings;
            });
        }, 1000);
      }
    }
  }
}