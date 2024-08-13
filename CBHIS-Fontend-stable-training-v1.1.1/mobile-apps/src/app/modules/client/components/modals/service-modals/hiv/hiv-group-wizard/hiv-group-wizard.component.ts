import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HivCounselingWizardComponent } from '../hiv-counseling-wizard/hiv-counseling-wizard.component';
import { SelfTestWizardComponent } from '../self-test-wizard/self-test-wizard.component';

@Component({
  selector: 'app-hiv-group-wizard',
  templateUrl: './hiv-group-wizard.component.html',
  styleUrls: ['./hiv-group-wizard.component.scss'],
})
export class HivGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'counseling':
        component = HivCounselingWizardComponent;
        break;
      case 'self-test':
        component = SelfTestWizardComponent;
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
