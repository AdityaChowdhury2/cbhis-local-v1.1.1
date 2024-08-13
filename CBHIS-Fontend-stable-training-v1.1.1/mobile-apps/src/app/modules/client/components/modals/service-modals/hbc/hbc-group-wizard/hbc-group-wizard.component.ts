import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HBCClientAssessmentWizardComponent } from '../hbc-client-assessment-wizard/hbc-client-assessment-wizard.component';
import { HbcServicesWizardComponent } from '../hbc-services-wizard/hbc-services-wizard.component';

@Component({
  selector: 'app-hbc-group-wizard',
  templateUrl: './hbc-group-wizard.component.html',
  styleUrls: ['./hbc-group-wizard.component.scss'],
})
export class HBCGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'hbc-service':
        component = HbcServicesWizardComponent;
        break;
      case 'client-assessment':
        component = HBCClientAssessmentWizardComponent;
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
