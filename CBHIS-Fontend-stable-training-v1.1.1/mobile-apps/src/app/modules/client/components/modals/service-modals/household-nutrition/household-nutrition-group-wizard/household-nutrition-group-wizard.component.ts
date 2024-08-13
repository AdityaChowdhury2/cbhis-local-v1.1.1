import { Component, Input, OnInit } from '@angular/core';
import { Client } from 'src/app/modules/client/models/client';
import { ModalItem } from 'src/app/modules/client/pages/service-points/service-points.component';
import { ModalService } from 'src/app/shared/services/modal.service';
import { BreastfeedingAndComplimentaryWizardComponent } from '../../../breastfeeding-and-complimentary-wizard/breastfeeding-and-complimentary-wizard.component';
import { DietaryDiversityWizardComponent } from '../../../dietary-diversity-wizard/dietary-diversity-wizard.component';
import { MinimumAcceptableDietWizardComponent } from '../../../minimum-acceptable-diet-wizard/minimum-acceptable-diet-wizard.component';

@Component({
  selector: 'app-household-nutrition-group-wizard',
  templateUrl: './household-nutrition-group-wizard.component.html',
  styleUrls: ['./household-nutrition-group-wizard.component.scss'],
})
export class HouseholdNutritionGroupWizardComponent implements OnInit {
  @Input() children!: ModalItem[];
  @Input() head!: Client;
  @Input() member!: Client;

  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // Open Wizard
  openWizard(item: ModalItem) {
    let component;
    switch (item.id) {
      case 'dietary-diversity':
        component = DietaryDiversityWizardComponent;
        break;
      case 'breastfeeding-complimentary':
        component = BreastfeedingAndComplimentaryWizardComponent;
        break;
      case 'minimum-acceptable-diet':
        component = MinimumAcceptableDietWizardComponent;
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
