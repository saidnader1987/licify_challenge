import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncatetext',
  standalone: true,
})
export class TruncateText implements PipeTransform {
  transform(value: any, limit: number = 10): any {
    if (value && value.length > limit) return value.substr(0, limit) + ' ...';
    return value;
  }
}
