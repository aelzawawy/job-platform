import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
})
export class DateAgoPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const number = Number(value);
    if (number) {
      const seconds = Math.floor((+new Date() - +new Date(number)) / 1000);
      if (seconds < 29)
        // less than 30 seconds ago will show as 'Just now'
        return 'Just now';
      const intervals = {
        y: 31536000,
        mon: 2592000,
        w: 604800,
        d: 86400,
        h: 3600,
        min: 60,
        sec: 1,
      };
      for (let [key, value] of Object.entries(intervals)) {
        const timePassed = Math.floor(seconds / value);
        if (timePassed === 1) {
          return timePassed + key;
        } else if (timePassed > 1) {
          return timePassed + key;
        }
      }
    }
    return number;
  }
}
