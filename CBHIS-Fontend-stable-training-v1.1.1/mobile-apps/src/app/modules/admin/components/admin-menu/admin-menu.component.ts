import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss'],
})
export class AdminMenuComponent implements OnInit {
  @Output() navbarMenuButtonClick = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}

  onNavbarMenuButtonClick() {
    this.navbarMenuButtonClick.emit();
  }
}
