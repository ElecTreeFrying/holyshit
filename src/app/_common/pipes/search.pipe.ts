import { Pipe, PipeTransform } from '@angular/core';
import { capitalize } from 'lodash';


@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, option: string, object?: any, data?: any): any {

    if (option === 'selection-display') {
      const views = [ 'pokémon', 'moves', 'items', 'berries' ];

      if (!value) return 'pokémon';

      return views[+value];
    }

    if (!value) return;

    if (option === 'spn-placeholder') {

      if (value.meta.max > 10100) {
        return `(${value.meta.min} to ${807}) and (${10001} to *${value.meta.max})`;
      }

      return `(${value.meta.min} to *${value.meta.max})`;
    }

    if (option === 'spn-mm-to-string') {
      return `${value}`;
    }

    if (option === 'spn-input-display') {
      if (object) return 'Invalid data.';

      if (value === '') return '';

      if (data === 'baseExperience') {
        return `${+value} pts.`;
      }

      if (data === 'baseHappiness' || data === 'captureRate') {
        const fixed = (+value / 255).toFixed(2);
        return `${ fixed.includes('.00') ? `${fixed.replace('.00', '')}` : fixed }%`;
      }

      if (data === 'hatchCounter') {
        return `${255 * (+value + 1)} steps`;
      }

      if (data === 'height') {
        return (+value / 3.048).toFixed(2).toString() + ' ft';
      }

      if (data === 'pokemonNo') {
        return `#${value}`;
      }

      if (data === 'weight') {
        return (+value / 4.536).toFixed(1).toString() + ' lbs';
      }

    }

  }

}
