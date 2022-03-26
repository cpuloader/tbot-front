import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFieldPipe',
})
export class DateFieldPipe implements PipeTransform {
  transform(value: any) {
    let date: Date;
    if (!value) return value;
    date = new Date(value);
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let sec = date.getSeconds();
    return date.getFullYear() + '.' +
           ((month > 9) ? month : '0' + month) + '.' +
           ((day > 9) ? day : '0' + day) + ' ' +
           ((hours > 9) ? hours : '0' + hours) + ':' +
           ((minutes > 9) ? minutes : '0' + minutes) + ':' +
           ((sec > 9) ? sec : '0' + sec);
  }
}
