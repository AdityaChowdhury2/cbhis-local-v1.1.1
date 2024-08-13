import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { NCDHistoryWizardComponent } from '../../../ncd-history-wizard/ncd-history-wizard.component';
import { NCDScreeningWizardComponent } from '../../../ncd-screening-wizard/ncd-screening-wizard.component';

@Component({
  selector: 'app-ncd-group-wizard',
  templateUrl: './ncd-group-wizard.component.html',
  styleUrls: ['./ncd-group-wizard.component.scss'],
})
export class NcdGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'ncd-history':
        component = NCDHistoryWizardComponent;
        break;
      case 'ncd-screening':
        component = NCDScreeningWizardComponent;
        break;
      default:
        component = null;
    }
    this.modalService.presentModal({
      component,
      componentProps: {
        children: item.children,
        head: this.head,
        member: this.member,
      },
      cssClass: item.cssClass,
    });
  }
  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
