import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  isOpen = false;
  constructor() {}

  ngOnInit() {}

  onLeftSidebarNavbarButtonClick() {
    this.isOpen = !this.isOpen;
    // const sidebar = document.getElementById('sidebar_menu');
    // if (sidebar?.classList?.contains('menu_active')) {
    //   sidebar?.classList?.remove('menu_active');
    // } else {
    //   sidebar?.classList?.add('menu_active');
    // }
  }
}
