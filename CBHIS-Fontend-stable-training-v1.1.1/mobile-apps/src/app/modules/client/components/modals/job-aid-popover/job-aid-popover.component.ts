import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-job-aid-popover',
  templateUrl: './job-aid-popover.component.html',
  styleUrls: ['./job-aid-popover.component.scss'],
})
export class JobAidPopoverComponent implements OnInit {
  @Input() jobAid: any;
  @Input() description: any;
  constructor(private modalService: ModalService) {}

  ngOnInit() {}
  dismissPopover() {
    this.modalService.dismissPopover();
  }
}
