import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit {
  @Output() navbarButtonClick = new EventEmitter<void>();
  constructor() {}

  ngOnInit() {}

  onNavbarButtonClick() {
    this.navbarButtonClick.emit();
  }
}
