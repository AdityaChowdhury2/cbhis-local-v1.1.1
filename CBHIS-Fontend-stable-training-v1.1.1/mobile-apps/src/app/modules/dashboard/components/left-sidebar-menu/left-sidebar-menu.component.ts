import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, from, map, Observable } from 'rxjs';
import { Client } from 'src/app/modules/client/models/client';
import { ClientStorageService } from 'src/app/modules/client/services/client-storage.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { HealthEducationWizardComponent } from '../../../client/components/modals/service-modals/health-education-wizard/health-education-wizard.component';

@Component({
  selector: 'app-left-sidebar-menu',
  templateUrl: './left-sidebar-menu.component.html',
  styleUrls: ['./left-sidebar-menu.component.scss'],
})
export class LeftSidebarMenuComponent implements OnInit {
  // Local variables
  familyHeadId!: string;
  individualId!: string;
  membersLength!: number;
  head!: Observable<Client | null>;
  familyMemberIds!: string[];
  selectedMembers!: Observable<Client[]>;
  nestedMenus: { [key: string]: boolean } = {
    AntenatalCareService: false,
    ChildHealth: false,
    HouseHoldNutrition: false,
    HIVServices: false,
    TBServices: false,
    MalariaService: false,
  };

  // Output variables
  @Output() navbarMenuButtonClick = new EventEmitter<void>();

  // Constructor with dependency injection
  constructor(
    private modalService: ModalService,
    private route: ActivatedRoute,
    private clientStorageService: ClientStorageService
  ) {}

  // Initialize the component
  ngOnInit() {
    this.familyHeadId = this.route.snapshot.queryParamMap.get('familyId') ?? '';
    this.individualId = this.route.snapshot.queryParamMap.get('individualId') ?? '';
    this.familyMemberIds = this.individualId?.split(',').map((id) => id.trim());

    // Fetch the  family members
    this.selectedMembers = from(this.clientStorageService.findMemberById(this.familyHeadId, this.familyMemberIds));

    // Fetch the family head
    this.head = from(this.clientStorageService.fetchMemberByOid(this.familyHeadId)).pipe(map((head) => head));

    this.membersLength = this.familyMemberIds.length;
  }

  // Toggle the nested menu
  toggleMenu(menu: string) {
    const isMenuVisible = this.nestedMenus[menu];
    for (let key in this.nestedMenus) {
      this.nestedMenus[key] = false;
    }
    if (!isMenuVisible) {
      this.nestedMenus[menu] = true;
    }
  }

  // Emit the navbar menu button click event
  onNavbarMenuButtonClick() {
    this.navbarMenuButtonClick.emit();
  }

  // Open the health education modal
  openHealthEducationModal() {
    // Combine the Observables
    const combinedData$ = forkJoin({
      selectedMembers: this.selectedMembers,
      head: this.head,
    }).pipe(map(({ selectedMembers, head }) => ({ selectedMembers, head })));

    // Subscribe to the combined data
    combinedData$.subscribe(({ selectedMembers, head }) => {
      // Load the data if the individualId is only one
      if (selectedMembers.length) {
        this.modalService.presentModal({
          component: HealthEducationWizardComponent,
          componentProps: {
            selectedMembers: selectedMembers,
            head: head,
          },
        });
      }
    });
  }

  // Open the ANC initiation modal
  // openANCInitiationModal() {
  //   // Combine the Observables
  //   const combinedData$ = forkJoin({
  //     selectedMembers: this.selectedMembers,
  //     head: this.head,
  //   }).pipe(map(({ selectedMembers, head }) => ({ selectedMembers, head })));

  //   // Subscribe to the combined data
  //   combinedData$.subscribe(({ selectedMembers, head }) => {
  //     // Load the data if the individualId is only one
  //     if (selectedMembers.length === 1) {
  //       this.modalService.presentModal({
  //         component: AncInitiationWizardComponent,
  //         componentProps: {
  //           head,
  //           member: selectedMembers[0],
  //         },
  //         cssClass: 'anc-initiation-wizard',
  //       });
  //     }
  //   });
  // }

  // Open the ANC discussed topics modal
  // openANCTopicsModal() {
  //   // Combine the Observables
  //   const combinedData$ = forkJoin({
  //     selectedMembers: this.selectedMembers,
  //     head: this.head,
  //   }).pipe(map(({ selectedMembers, head }) => ({ selectedMembers, head })));

  //   // Subscribe to the combined data
  //   combinedData$.subscribe(({ selectedMembers, head }) => {
  //     // Load the data and present the modal
  //     this.modalService.presentModal({
  //       component: AncDiscussedTopicsWizardComponent,
  //       componentProps: {
  //         head,
  //         member: selectedMembers[0],
  //       },
  //       cssClass: 'anc-discussed-topics-wizard',
  //     });
  //   });
  // }

  // Open the ANC counseling modal
  // openANCCounselingModal() {
  //   this.modalService.presentModal({
  //     component: AncCounselingForPregnancyWizardComponent,

  //     cssClass: 'anc-counseling-for-pregnancy-wizard',
  //   });
  // }
}
