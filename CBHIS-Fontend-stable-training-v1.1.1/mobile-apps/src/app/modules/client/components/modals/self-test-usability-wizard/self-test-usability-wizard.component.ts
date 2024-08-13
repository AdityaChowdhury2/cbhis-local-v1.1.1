import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-self-test-usability-wizard',
  templateUrl: './self-test-usability-wizard.component.html',
  styleUrls: ['./self-test-usability-wizard.component.scss'],
})
export class SelfTestUsabilityWizardComponent implements OnInit {
  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  // For submitting the form
  onSubmit() {
    // TODO: Implement onSubmit method
    // On successful submission, dismiss the modal
    this.dismissModal();
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
