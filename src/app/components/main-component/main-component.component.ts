import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';

@Component({
  selector: 'app-main-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-component.component.html',
  styleUrl: './main-component.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MainComponentComponent implements OnInit {

  photos = [
    { id: 1, url: '3.png', title: 'July. Summer butterflies.', description: 'Добавлено 15 августа' },
    { id: 2, url: '4.png', title: 'Summer butterflies.', description: 'Добавлено 15 августа' },
    { id: 3, url: '5.jpg', title: 'July. Summer butterflies.', description: 'Добавлено 15 августа' },
    // { id: 4, url: '2.png', title: 'Summer butterflies.', description: 'Добавлено 15 августа' },
    { id: 5, url: 'Home.jpg', title: 'July. Summer butterflies.', description: 'Добавлено 15 августа' },
    { id: 6, url: 'test.jpg', title: 'Summer butterflies.', description: 'Добавлено 15 августа' },
    { id: 7, url: 'test3.jpg', title: 'July. Summer butterflies.', description: 'Добавлено 15 августа' },
    // { id: 8, url: 'path/to/photo2.jpg', title: 'Summer butterflies.', description: 'Добавлено 15 августа' },
    // { id: 9, url: 'path/to/photo1.jpg', title: 'July. Summer butterflies.', description: 'Добавлено 15 августа' },
    // { id: 10, url: 'path/to/photo2.jpg', title: 'Summer butterflies.', description: 'Добавлено 15 августа' },
    // { id: 11, url: 'path/to/photo1.jpg', title: 'July. Summer butterflies.', description: 'Добавлено 15 августа' },
    // { id: 12, url: 'path/to/photo2.jpg', title: 'Summer butterflies.', description: 'Добавлено 15 августа' },
    // Добавьте остальные фото аналогичным образом
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
