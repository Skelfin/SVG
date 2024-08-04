import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { MainPhoto } from '../../types/photo';
import { RegisterService } from '../../services/register.service';
import { RegistrationModalComponent } from '../reg-modal/reg-modal.component';

@Component({
  selector: 'app-main-component',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterLink,
    RegistrationModalComponent,
  ],
  templateUrl: './main-component.component.html',
  styleUrls: ['./main-component.component.scss'],
  providers: [DatePipe],
})
export class MainComponentComponent implements OnInit {
  faPlus = faPlus;
  faAngleDown = faAngleDown;

  photos: MainPhoto[] = [];
  groupedPhotos: { monthYear: string, photos: MainPhoto[] }[] = [];
  lastId: string = 'initial';
  hasMorePhotos: boolean = true;
  isLoading: boolean = true;
  isLoadingMore: boolean = false;
  isAuthenticated: boolean = false;

  @ViewChild('regAuthModal') regAuthModal!: RegistrationModalComponent;

  constructor(
    private photoService: PhotoService,
    private datePipe: DatePipe,
    private registerService: RegisterService,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.registerService.isAuthenticated();
    this.registerService.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
    this.loadPhotos();
  }


  loadPhotos(): void {
    this.isLoading = true;
    const lastIdParam = this.lastId !== 'initial' ? this.lastId : '';
    this.photoService.getPhotos(lastIdParam).subscribe((newPhotos: MainPhoto[]) => {
      this.processLoadedPhotos(newPhotos);
      this.isLoading = false;
    });
  }

  loadMore(): void {
    if (!this.hasMorePhotos) return;

    this.isLoadingMore = true;
    const lastIdParam = this.lastId !== 'initial' ? this.lastId : '';
    this.photoService.getPhotos(lastIdParam).subscribe((newPhotos: MainPhoto[]) => {
      this.processLoadedPhotos(newPhotos);
      this.isLoadingMore = false;
    });
  }

  private processLoadedPhotos(newPhotos: MainPhoto[]): void {
    if (newPhotos.length > 0) {
      this.photos = [...this.photos, ...newPhotos];
      this.lastId = this.photos[this.photos.length - 1].ID;
      this.hasMorePhotos = newPhotos.length >= 12;
      this.groupPhotosByMonthYear();
    } else {
      this.hasMorePhotos = false;
    }
  }

  private groupPhotosByMonthYear(): void {
    const grouped: { [key: string]: MainPhoto[] } = {};

    this.photos.forEach(photo => {
      const date = new Date(photo.Date_created);
      const monthYear = this.formatMonthYear(date);
      
      if (grouped[monthYear]) {
        grouped[monthYear].push(photo);
      } else {
        grouped[monthYear] = [photo];
      }
    });

    this.groupedPhotos = Object.keys(grouped).map(key => ({
      monthYear: key,
      photos: grouped[key]
    }));
  }

  private formatMonthYear(date: Date): string {
    const formattedDate = this.datePipe.transform(date, 'LLLL, y', 'ru-RU');
    if (formattedDate) {
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
    return 'Дата неизвестна';
  }
}
