import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Output() buttonClick = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onButtonClick() {
    this.buttonClick.emit();
  }

  // sidebarHandler() {
  //   const sidebar = document.getElementById('sidebar-menu');
  //   if (sidebar?.classList?.contains('menu_active')) {
  //     sidebar?.classList?.remove('menu_active');
  //   } else {
  //     sidebar?.classList?.add('menu_active');
  //   }
  // }
}
