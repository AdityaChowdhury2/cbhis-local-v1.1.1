import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AddZoneWizardComponent } from '../../components/add-zone-wizard/add-zone-wizard.component';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
})
export class ZonesComponent implements OnInit {
  // * Local Variables
  zones: any[] = [
    {
      zoneId: 1,
      name: 'Zone 1',
    },
    {
      zoneId: 2,
      name: 'Zone 2',
    },
    {
      zoneId: 3,
      name: 'Zone 3',
    },
  ];

  // * Constructor
  constructor(private modalService: ModalService) {}

  // * Init Initial Data
  ngOnInit() {}

  // * Open Modal for add zone form
  openModal() {
    this.modalService.presentModal({ component: AddZoneWizardComponent });
  }
}
