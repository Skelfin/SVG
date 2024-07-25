import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { Photo } from '../../types/photo';

@Component({
  selector: 'app-main-component',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.scss'],
  providers: [DatePipe]
})
export class MainComponentComponent implements OnInit {
  faPlus = faPlus;
  faAngleDown = faAngleDown;

  photos: Photo[] = [];
  lastId: number = Number.MAX_SAFE_INTEGER;
  hasMorePhotos: boolean = true;
  isLoading: boolean = true;
  isLoadingMore: boolean = false;

  constructor(private photoService: PhotoService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.photoService.getPhotos(this.lastId).subscribe((newPhotos: Photo[]) => {
      if (newPhotos.length > 0) {
        newPhotos.forEach(photo => {
          photo.Date_created = this.datePipe.transform(photo.Date_created, 'd MMMM y', 'ru-RU')!;
        });
        this.photos = [...this.photos, ...newPhotos];
        this.lastId = newPhotos[newPhotos.length - 1].ID;
        this.checkForMorePhotos();
      } else {
        this.hasMorePhotos = false;
      }
      this.isLoading = false;
      this.isLoadingMore = false;
    });
  }

  loadMore(): void {
    this.isLoadingMore = true;
    this.loadPhotos();
  }

  checkForMorePhotos(): void {
    this.photoService.getPhotos(this.lastId).subscribe((newPhotos: Photo[]) => {
      if (newPhotos.length === 0) {
        this.hasMorePhotos = false;
      }
    });
  }
}