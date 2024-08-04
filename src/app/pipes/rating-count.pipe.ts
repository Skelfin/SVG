import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ratingCount',
  standalone: true
})
export class RatingCountPipe implements PipeTransform {

  transform(value: number): string {
    if (value === 0) {
      return 'нет оценок';
    }

    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['оценка', 'оценки', 'оценок'];
    const mod = value % 100;
    return `${value} ${titles[(mod > 4 && mod < 20) ? 2 : cases[Math.min(mod % 10, 5)]]}`;
  }

}
