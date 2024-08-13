import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-anc-counseling-for-pregnancy-wizard',
  templateUrl: './anc-counseling-for-pregnancy-wizard.component.html',
  styleUrls: ['./anc-counseling-for-pregnancy-wizard.component.scss'],
})
export class AncCounselingForPregnancyWizardComponent implements OnInit {
  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // * Dismiss Modal Service
  dismissModal() {
    this.modalService.dismissModal();
  }
}
