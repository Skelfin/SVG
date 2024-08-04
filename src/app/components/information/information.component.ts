import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PhotoInfo } from '../../types/photo';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './information.component.html',
  styleUrl: './information.component.scss',
  providers: [DatePipe]
})
export class InformationComponent implements OnChanges {
  faAngleLeft = faAngleLeft;
  @Input() photo?: PhotoInfo;
  formattedDate!: string;

  constructor(private datePipe: DatePipe) {}

  ngOnChanges(): void {
    if (this.photo) {
      this.formattedDate = this.datePipe.transform(this.photo.Date_created, 'd MMMM y', 'ru-RU')!;
    }
  }
}