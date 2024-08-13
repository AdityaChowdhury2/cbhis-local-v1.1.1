import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/shared/services/theme.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  light = true;
  dark = false;
  gray = false;
  constructor(private theme: ThemeService) {}

  ngOnInit() {}

  changeTheme(name: string) {
    this.theme.setTheme(name);

    if (name === 'light') {
      this.light = true;
      this.dark = false;
      this.gray = false;
    }
    if (name === 'dark') {
      this.light = false;
      this.dark = true;
      this.gray = false;
    }
    if (name === 'gray') {
      this.light = false;
      this.dark = false;
      this.gray = true;
    }
    // console.log(this.theme.getGlobalCSS());
  }
}
