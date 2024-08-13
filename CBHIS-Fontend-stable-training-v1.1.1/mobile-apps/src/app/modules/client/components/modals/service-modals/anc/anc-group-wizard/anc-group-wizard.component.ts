import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AncDiscussedTopicsWizardComponent } from '../anc-discussed-topics-wizard/anc-discussed-topics-wizard.component';
import { AncInitiationWizardComponent } from '../anc-initiation-wizard/anc-initiation-wizard.component';

@Component({
  selector: 'app-anc-group-wizard',
  templateUrl: './anc-group-wizard.component.html',
  styleUrls: ['./anc-group-wizard.component.scss'],
})
export class AncGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    console.log(this.children, this.head, this.member);
  }

  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'anc-initiation':
        component = AncInitiationWizardComponent;
        break;
      case 'anc-topics':
        component = AncDiscussedTopicsWizardComponent;
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
