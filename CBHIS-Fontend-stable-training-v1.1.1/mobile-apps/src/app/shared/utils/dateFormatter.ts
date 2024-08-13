import { formatDate } from '@angular/common';

export const dateFormatter = (date: string, formatString: string = 'dd-MM-yyyy') => {
  console.log('in date formatter ', formatDate(new Date(date), formatString, 'en-BD'));
  return formatDate(new Date(date), formatString, 'en-BD');
};
