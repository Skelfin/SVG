import { Component, Input } from '@angular/core';
import { PhotoPath } from '../../types/photo';
import { API_URL } from '../../constants/constants';

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss'
})
export class PhotoComponent {
  API_URL = API_URL
  @Input() photo?: PhotoPath;

}