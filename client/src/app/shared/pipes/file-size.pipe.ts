import { Pipe, PipeTransform } from '@angular/core';

const units: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(size: number, precision = 3, unit = null): string {
    if (size === null || isNaN(size)) return null;
    if (unit) {
      unit = unit.toUpperCase();
    }
    let max = units.indexOf(unit);

    if (unit && max < 0) throw Error('Invalid unit specified');

    let i = 0;
    while (size / 1000 > 1) {
      size = size / 1000;
      i++;
    }
    return size.toFixed(precision) + " " + units[i];
  }
}
