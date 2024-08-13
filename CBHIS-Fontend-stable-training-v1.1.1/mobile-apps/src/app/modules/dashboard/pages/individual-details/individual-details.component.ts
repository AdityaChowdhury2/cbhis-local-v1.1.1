import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, from, of, switchMap } from 'rxjs';
import { AddDependentWizardComponent } from 'src/app/modules/client/components/modals/add-dependent-wizard/add-dependent-wizard.component';
import { MaritalStatus } from 'src/app/modules/client/enums/client.enum';
import { Client } from 'src/app/modules/client/models/client';
import { ClientStorageService } from 'src/app/modules/client/services/client-storage.service';

import { SearchStorageService } from 'src/app/modules/client/services/search-storage.service';
import { Education } from 'src/app/shared/enums/education.enum';
import { Gender } from 'src/app/shared/enums/gender.enum';

import { ModalService } from 'src/app/shared/services/modal.service';
import { RelationTypeOptions } from 'src/app/shared/utils/common';

@Component({
  selector: 'app-individual-details',
  templateUrl: './individual-details.component.html',
  styleUrls: ['./individual-details.component.scss'],
})
export class IndividualDetailsComponent implements OnInit {
  familyId!: string;
  individualId!: string;
  head!: Client;
  familyIds!: any[];
  selectedMembers!: Observable<Client[]>;
  relationTypeOptions = RelationTypeOptions;
  sexOptions = [
    { value: Gender.Male, label: 'Lomdvuna' },
    { value: Gender.Female, label: 'Lomsikati' },
    { value: Gender.Unknown, label: 'Lobulili lobunye' },
  ];
  maritalStatusOptions = [
    { value: MaritalStatus.Single, label: 'Longakatsatfwa' },
    { value: MaritalStatus.Married, label: 'Lotsetfwe' },
    { value: MaritalStatus.Widowed, label: 'Umfelokati/Umfelwa' },
    { value: MaritalStatus.Divorced, label: 'Labahlukana ngalokusemtsetfweni' },
    { value: MaritalStatus.Separated, label: 'labacabana bangahlukani ngekwemtsetfo' },
  ];
  educationLevelOptions = [
    { value: Education.Primary, key: 'Sikolwa lesincane' },
    { value: Education.Secondary, key: 'Isekhondari' },
    { value: Education.HighSchool, key: 'Imfundvo lephakeme' },
    { value: Education.Tertiary, key: 'Tekufundzela' },
  ];
  private selectedMemberSubscription: Subscription = new Subscription();
  displayRelation!: string;

  genderGroups!: (string | undefined)[];

  // * constructor
  constructor(
    private route: ActivatedRoute,
    private searchStorageService: SearchStorageService,
    private modalService: ModalService,
    private clientStorageService: ClientStorageService
  ) {}

  // * Initial Load Data
  ngOnInit() {
    this.familyId = this.route.snapshot.queryParamMap.get('familyId') ?? '';
    this.individualId = this.route.snapshot.queryParamMap.get('individualId') ?? '';
    this.familyIds = this.individualId?.split(',');
    // this.searchStorageService.getFamilyMembers(+this.familyId).then(() => {
    //   console.log('SearchStorageService initialized');
    // });
    console.log(' Family id ', this.familyId);
    console.log(' individual id ', this.individualId);
    console.log(' Family ids ', this.familyIds);

    this.selectedMembers = from(this.clientStorageService.fetchClients()).pipe(
      switchMap((res) => {
        console.log(res);
        this.head = res.filter((i) => i.Oid === this.familyId)[0];
        const filteredMembers = this.familyIds?.map((id) => res.filter((i) => i.Oid === id)[0]);
        return of(filteredMembers);
      })
    );

    this.selectedMemberSubscription.add(
      this.selectedMembers.subscribe((members) => {
        this.head = members?.filter((member) => member?.IsFamilyHead === true)[0];
        this.genderGroups = members?.map((member) => this.getGenderGroup(member?.Sex));
      })
    );

    // * Get Family Members Data
    // try {
    //   this.searchStorageService
    //     .membersState()
    //     .pipe(
    //       switchMap((res) => {
    //         console.log(res);
    //         if (res) {
    //           return this.searchStorageService.fetchMembers();
    //         } else {
    //           return of([]);
    //         }
    //       })
    //     )
    //     .subscribe((members) => {
    //       const headData = members.filter((i) => i.ishousehead === 1)[0];
    //       console.log(members);
    //       this.head = headData;
    //       this.selectedMembers = this.familyIds?.map((id) => {
    //         return members.filter((i) => i.id === +id)[0];
    //       });
    //       console.log('selected Members', this.selectedMembers);
    //     });
    // } catch (error) {
    //   console.log('Family Member Get Error =>', error);
    // }
  }

  // * Modal Handler
  openModal() {
    this.modalService.presentModal({
      component: AddDependentWizardComponent,
      componentProps: { head: this.head },
      cssClass: 'add-dependent-wizard',
    });
  }

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

  // * Filter Relationship
  getRelations(id: number | undefined) {
    if (id) {
      return this.relationTypeOptions.find((relation) => relation.value === id)?.key;
    } else {
      return 'N/A';
    }
  }
}
