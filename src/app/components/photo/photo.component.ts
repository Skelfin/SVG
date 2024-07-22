import { Component } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss'
})
export class PhotoComponent {
  selectedImage!: string;

  openLightbox(image: string) {
    this.selectedImage = image;
    const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    lightboxModal.show();
  }
}
