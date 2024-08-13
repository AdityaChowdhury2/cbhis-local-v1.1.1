import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  isOpen = false;

  constructor() {}

  ngOnInit() {}

  onLeftSidebarNavbarButtonClick() {
    this.isOpen = !this.isOpen;
  }

  // onLeftSidebarNavbarButtonClick() {
  //   const sidebar = document.getElementById('sidebar_menu');
  //   if (sidebar?.classList?.contains('menu_active')) {
  //     sidebar?.classList?.remove('menu_active');
  //   } else {
  //     sidebar?.classList?.add('menu_active');
  //   }
  // }
}
