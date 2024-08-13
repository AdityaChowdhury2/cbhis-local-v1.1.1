// language.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  useSwati: boolean = true;

  private changeLanguage: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  public languageObservable$: Observable<any> = this.changeLanguage.asObservable();

  toggleLanguage(value: boolean) {
    this.changeLanguage.next(value);
  }

  // constructor(private translate: TranslateService) {
  //   this.translate.setDefaultLang('ss');
  // }
  // test() {
  //   // this.text = this.useSwati ? 'achem' : 'aditya';
  //   return this.useSwati ? { ...englishText } : { ...swText } || { ...englishText };
  // }

  // get currentLanguage(): string {
  //   return this.useSwati ? 'ss' : 'en';
  // }

  // get texts() {
  //   return this.useSwati ? { ...englishText } : { ...swText } || { ...englishText };
  // }
}
