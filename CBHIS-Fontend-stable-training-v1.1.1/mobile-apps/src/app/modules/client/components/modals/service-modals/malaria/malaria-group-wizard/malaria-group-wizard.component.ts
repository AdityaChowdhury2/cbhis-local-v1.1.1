import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HouseholdControlInterventionWizardComponent } from '../../../../household-control-intervention-wizard/household-control-intervention-wizard.component';
import { MalariaCaseFindingWizardComponent } from '../../../../malaria-case-finding-wizard/malaria-case-finding-wizard.component';
import { MalariaRiskWizardComponent } from '../../../../malaria-risk-wizard/malaria-risk-wizard.component';
import { MalariaSymptomsWizardComponent } from '../../../../malaria-symptoms-wizard/malaria-symptoms-wizard.component';
import { MalariaPreventionWizardComponent } from '../../../malaria-prevention-wizard/malaria-prevention-wizard.component';

@Component({
  selector: 'app-malaria-group-wizard',
  templateUrl: './malaria-group-wizard.component.html',
  styleUrls: ['./malaria-group-wizard.component.scss'],
})
export class MalariaGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'malaria-risks':
        component = MalariaRiskWizardComponent;
        break;
      case 'malaria-symptoms':
        component = MalariaSymptomsWizardComponent;
        break;
      case 'case-finding':
        component = MalariaCaseFindingWizardComponent;
        break;
      case 'malaria-prevention':
        component = MalariaPreventionWizardComponent;
        break;
      case 'control-intervention':
        component = HouseholdControlInterventionWizardComponent;
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
