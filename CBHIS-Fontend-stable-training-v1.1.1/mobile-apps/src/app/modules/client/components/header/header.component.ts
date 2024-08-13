import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(public languageService: LanguageService) {}

  ngOnInit() {}

  onLanguageChange(event: any) {
    this.languageService.toggleLanguage(JSON.parse(event.target.value));
  }

  changeLanguage() {
    this.languageService.toggleLanguage(true);
  }
}
