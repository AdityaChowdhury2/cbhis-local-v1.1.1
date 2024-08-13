import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { InfectionControlAssessmentWizardComponent } from '../infection-control-assessment-wizard/infection-control-assessment-wizard.component';
import { SymptomsScreeningWizardComponent } from '../symptoms-screening-wizard/symptoms-screening-wizard.component';
import { TBDiscussedTopicWizardComponent } from '../tb-discussed-topic-wizard/tb-discussed-topic-wizard.component';
import { TbEnvironmentAssessmentWizardComponent } from '../tb-environment-assessment-wizard/tb-environment-assessment-wizard.component';

@Component({
  selector: 'app-tb-group-wizard',
  templateUrl: './tb-group-wizard.component.html',
  styleUrls: ['./tb-group-wizard.component.scss'],
})
export class TbGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'infection-control':
        component = InfectionControlAssessmentWizardComponent;
        break;
      case 'symptoms-screening':
        component = SymptomsScreeningWizardComponent;
        break;
      case 'environment-assessment':
        component = TbEnvironmentAssessmentWizardComponent;
        break;
      case 'tb-discussed-topic':
        component = TBDiscussedTopicWizardComponent;
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
