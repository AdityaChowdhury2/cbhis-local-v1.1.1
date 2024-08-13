import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { ChildGrowthMonitoringWizardComponent } from '../child-growth-monitoring-wizard/child-growth-monitoring-wizard.component';
import { ImmunizationWizardComponent } from '../immunization-wizard/immunization-wizard.component';

@Component({
  selector: 'app-child-health-group-wizard',
  templateUrl: './child-health-group-wizard.component.html',
  styleUrls: ['./child-health-group-wizard.component.scss'],
})
export class ChildHealthGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'child-growth-monitoring':
        component = ChildGrowthMonitoringWizardComponent;
        break;
      case 'child-immunization':
        component = ImmunizationWizardComponent;
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
