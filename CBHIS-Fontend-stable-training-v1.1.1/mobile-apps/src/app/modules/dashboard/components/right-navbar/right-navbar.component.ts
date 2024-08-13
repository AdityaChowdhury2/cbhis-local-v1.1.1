import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-right-navbar',
  templateUrl: './right-navbar.component.html',
  styleUrls: ['./right-navbar.component.scss'],
})
export class RightNavbarComponent1 implements OnInit {
  @Input() title: string = '';
  constructor(private location: Location) {}

  ngOnInit() {}

  navigateBack() {
    this.location.back();
  }
}
