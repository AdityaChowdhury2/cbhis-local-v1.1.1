import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { Observable, Subscription, from, map } from 'rxjs';
import { Education } from 'src/app/shared/enums/education.enum';
import { Gender } from 'src/app/shared/enums/gender.enum';

import { ModalService } from 'src/app/shared/services/modal.service';
import { RelationTypeOptions } from 'src/app/shared/utils/common';
import { AddDependentWizardComponent } from '../../components/modals/add-dependent-wizard/add-dependent-wizard.component';
import { AddGroupServiceWizardComponent } from '../../components/modals/add-group-service-wizard/add-group-service-wizard.component';
import { MaritalStatus } from '../../enums/client.enum';
import { Client } from '../../models/client';
import { ClientStorageService } from '../../services/client-storage.service';
import { SearchStorageService } from '../../services/search-storage.service';

@Component({
  selector: 'app-family-details',
  templateUrl: './family-details.component.html',
  styleUrls: ['./family-details.component.scss'],
})
export class FamilyDetailsComponent implements OnInit {
  familyId!: string;
  familyDetails: any;
  familyMembers!: Observable<Client[]>;
  head!: Client;
  selectedMember: string[] = [];
  selectRemove: boolean = false;
  relationTypeOptions = RelationTypeOptions;
  sexOptions = [
    { value: Gender.Male, label: 'Lomdvuna' },
    { value: Gender.Female, label: 'Lomsikati' },
    { value: Gender.Unknown, label: 'Lobulili lobunye' },
  ];
  maritalStatusOptions = [
    { value: MaritalStatus.Single, key: 'Longakatsatfwa' },
    { value: MaritalStatus.Married, key: 'Lotsetfwe' },
    { value: MaritalStatus.Widowed, key: 'Umfelokati/Umfelwa' },
    { value: MaritalStatus.Divorced, key: 'Labahlukana ngalokusemtsetfweni' },
    { value: MaritalStatus.Separated, key: 'labacabana bangahlukani ngekwemtsetfo' },
  ];
  educationLevelOptions = [
    { value: Education.Primary, key: 'Sikolwa lesincane' },
    { value: Education.Secondary, key: 'Isekhondari' },
    { value: Education.HighSchool, key: 'Imfundvo lephakeme' },
    { value: Education.Tertiary, key: 'Tekufundzela' },
  ];
  private familyMemberSubscription: Subscription = new Subscription();
  familyMemberLength: number = 0;
  showMakeFamilyHeadButton: boolean = false;
  selectedForHead!: string;

  genderGroups!: (string | undefined)[];

  constructor(
    private route: ActivatedRoute,
    private searchStorageService: SearchStorageService,
    private modalService: ModalService,
    private clientStorageService: ClientStorageService
  ) {
    addIcons({
      environment: 'assets/icons/environment.svg',
    });
  }

  // * Initial Load
  ngOnInit() {
    this.clientStorageService.loadClients();

    this.clientStorageService.fetchClients().subscribe((res) => {
      console.log('CLients in family details', res);
    });
    this.familyId = this.route.snapshot.paramMap.get('familyId') ?? '';
    console.log(this.familyId);

    // this.searchStorageService.getFamilyMembers(+this.familyId).then(() => {
    //   console.log('SearchStorageService initialized');
    // });
    // this.clientStorageService.from(this.clientStorageService.fetchClients()().then((res) => {});

    this.familyMembers = from(this.clientStorageService.fetchClients()).pipe(
      map((res) => res.filter((client) => client.Oid === this.familyId || client.FamilyHeadId === this.familyId))
    );

    this.familyMemberSubscription.add(
      this.familyMembers.subscribe((member) => {
        this.familyMemberLength = member.length;
        this.head = member.filter((i) => i.IsFamilyHead)[0];
        this.genderGroups = member.map((member) => this.getGenderGroup(member?.Sex));
      })
    );

    // this.clientStorageService.findFamilyMembers(this.familyId).then((res) => {
    //   this.familyMembers = res;
    //   console.log(res);
    //   const headData = res.filter((i) => i.IsFamilyHead === 1)[0];
    //   this.head = headData;
    //   console.log('Head data', this.head);
    //   this.genderGroups = res.map((member) => this.getGenderGroup(member?.Sex));
    //   console.log(this.genderGroups);
    // });

    try {
      // this.searchStorageService
      //   .membersState()
      //   .pipe(
      //     switchMap((res) => {
      //       if (res) {
      //         return this.searchStorageService.fetchMembers();
      //       } else {
      //         return of([]);
      //       }
      //     })
      //   )
      //   .subscribe((members) => {
      //     this.familyMembers = members;
      //     const headData = members.filter((i) => i.ishousehead === 1)[0];
      //     this.head = headData;
      //     console.log('Head Data', headData);
      //   });
    } catch (error) {}
  }

  // * Modal Handler
  openModal() {
    this.modalService.presentModal({
      component: AddDependentWizardComponent,
      componentProps: { head: this.head },
      cssClass: 'add-dependent-wizard',
    });
  }

  // * Filter Relationship
  getRelations(id: number | undefined) {
    if (id) {
      return this.relationTypeOptions.find((relation) => relation.value === id)?.key;
    } else {
      return 'N/A';
    }
  }

  // * Checkbox Change Handler
  onCheckboxChange(event: any, value: any) {
    if (event.detail.checked) {
      // Add the member if not already selected
      if (!this.selectedMember.includes(value)) {
        this.selectedMember = [...this.selectedMember, value.toString()];
      }
    } else {
      // Remove the member if unselected
      this.selectedMember = this.selectedMember.filter((i) => i !== value.toString());
    }

    // Determine if the 'Make Family Head' button should be shown
    if (this.selectedMember.length === 1 && this.selectedMember[0] !== this.head?.Oid.toString()) {
      this.selectedForHead = this.selectedMember[0];
      this.showMakeFamilyHeadButton = true;
    } else {
      this.showMakeFamilyHeadButton = false;
    }

    // Check if all family members are selected
    this.selectRemove = this.selectedMember.length === this.familyMemberLength;

    console.log(this.selectedMember);
  }

  // * Handle All Select Members
  // allSelectHandler(event: any) {
  //   const allIds = this.familyMembers?.map((i) => {
  //     return i.id;
  //   });
  //   if (event.detail.checked) {
  //     this.selectedMember = allIds;
  //     this.allSelected = true;
  //   } else {
  //     this.selectedMember = [];
  //     this.allSelected = false;
  //   }
  // }

  // * Service Modal Handler
  openGroupServiceModal() {
    console.log('this head ', this.head);
    this.modalService.presentModal({
      component: AddGroupServiceWizardComponent,
      componentProps: { familyHeadId: this.head?.Oid },
      cssClass: 'add-group-service-wizard',
    });
  }

  // * Generate Gender Group
  getGenderGroup(genderId: number) {
    switch (genderId) {
      case Gender.Male:
        return 'M';
      case Gender.Female:
        return 'F';
      case Gender.Unknown:
        return 'U';
      default:
        return 'U';
    }
  }

  getGenderImage(number: number) {
    return `../../../../../assets/icon/gender/gender-${number}.png`;
  }

  async makeFamilyHead(clientId: string, headId: string) {
    console.log('Make Family Head', clientId, headId);

    // await this.clientStorageService.changeHeadOfFamily(clientId, headId);
  }

  // * Unsubscribe
  ngOnDestroy() {
    this.familyMemberSubscription.unsubscribe(); // This will unsubscribe when the component is destroyed
  }
}
