import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-right-navbar',
  templateUrl: './right-navbar.component.html',
  styleUrls: ['./right-navbar.component.scss'],
})
export class RightNavbarComponent implements OnInit {
  @Input() title: string = '';
  constructor(private location: Location, private toastService: ToastService) {}

  ngOnInit() {}

  navigateBack() {
    console.log('navigateBack ', this.location);
    this.location.back();
  }

  openToast() {
    this.toastService.openToast({
      message: 'This is a toast message',
      duration: 99999,
      color: 'success',
    });
  }
}
