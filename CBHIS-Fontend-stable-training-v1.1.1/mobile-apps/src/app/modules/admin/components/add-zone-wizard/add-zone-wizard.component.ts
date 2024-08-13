import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/shared/services/modal.service';

@Component({
  selector: 'app-add-zone-wizard',
  templateUrl: './add-zone-wizard.component.html',
  styleUrls: ['./add-zone-wizard.component.scss'],
})
export class AddZoneWizardComponent implements OnInit {
  // * Local Variables
  zoneform: FormGroup = new FormGroup({});

  // * Constructor
  constructor(private modalService: ModalService) {}

  // * Init Initial Data
  ngOnInit() {
    this.zoneform = new FormGroup({
      zonename: new FormControl('', Validators.required),
    });
  }

  // * For close the modal
  closeWizard() {
    this.modalService.dismissModal();
  }

  // * For save the form
  save() {
    console.log(this.zoneform.get('zonename')?.value);
    this.modalService.dismissModal();
  }
}
