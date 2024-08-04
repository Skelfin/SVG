import { Component, Input } from '@angular/core';
import { PhotoPath } from '../../types/photo';

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss'
})
export class PhotoComponent {
  @Input() photo?: PhotoPath;

}