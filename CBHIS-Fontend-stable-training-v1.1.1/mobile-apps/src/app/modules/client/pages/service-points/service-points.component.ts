import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, forkJoin, from, map, switchMap } from 'rxjs';

import { HealthEducationWizardComponent } from 'src/app/modules/client/components/modals/service-modals/health-education-wizard/health-education-wizard.component';
import { Education } from 'src/app/shared/enums/education.enum';
import { Gender } from 'src/app/shared/enums/gender.enum';

import { ModalService } from 'src/app/shared/services/modal.service';
import { RelationTypeOptions } from 'src/app/shared/utils/common';
import { ARTWizardComponent } from '../../components/modals/art-wizard/art-wizard.component';
import { HBCClientAssessmentWizardComponent } from '../../components/modals/service-modals/hbc/hbc-client-assessment-wizard/hbc-client-assessment-wizard.component';

import { ModalArray, ServiceListCategoryToShow } from 'src/app/shared/utils/serviceArray';
import { AncGroupWizardComponent } from '../../components/modals/service-modals/anc/anc-group-wizard/anc-group-wizard.component';
import { ChildHealthGroupWizardComponent } from '../../components/modals/service-modals/child-health/child-health-group-wizard/child-health-group-wizard.component';
import { FamilyPlanningServiceWizardComponent } from '../../components/modals/service-modals/family-planning-service-wizard/family-planning-service-wizard.component';
import { HBCGroupWizardComponent } from '../../components/modals/service-modals/hbc/hbc-group-wizard/hbc-group-wizard.component';
import { HivGroupWizardComponent } from '../../components/modals/service-modals/hiv/hiv-group-wizard/hiv-group-wizard.component';
import { HouseholdNutritionGroupWizardComponent } from '../../components/modals/service-modals/household-nutrition/household-nutrition-group-wizard/household-nutrition-group-wizard.component';
import { MalariaGroupWizardComponent } from '../../components/modals/service-modals/malaria/malaria-group-wizard/malaria-group-wizard.component';
import { NcdGroupWizardComponent } from '../../components/modals/service-modals/ncd/ncd-group-wizard/ncd-group-wizard.component';
import { PostnatalWizardComponent } from '../../components/modals/service-modals/postnatal/postnatal-wizard/postnatal-wizard.component';
import { TbGroupWizardComponent } from '../../components/modals/service-modals/tb/tb-group-wizard/tb-group-wizard.component';
import { MaritalStatus } from '../../enums/client.enum';
import { Client } from '../../models/client';
import { ClientStorageService } from '../../services/client-storage.service';

export interface ModalItem {
  id: string;
  title: string;
  icon: string;
  children: ModalItem[] | null;
  cssClass: string;
  category: ServiceListCategoryToShow;
  gender: number;
  siSwati: string;
}
@Component({
  selector: 'app-service-points',
  templateUrl: './service-points.component.html',
  styleUrls: ['./service-points.component.scss'],
})
export class ServicePointsComponent implements OnInit {
  familyHeadId!: string;
  individualId!: string;
  familyIds!: any[];
  relationTypeOptions = RelationTypeOptions;
  singleMemberGender!: number;
  private subscription: Subscription = new Subscription();

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

  head$!: Observable<Client | null>;
  familyMemberIds!: string[];
  selectedMembers$!: Observable<Client[]>;
  membersLength!: number;
  combinedData!: { selectedMembers: Client[]; head: Client | null };
  serviceArray: ModalItem[];

  constructor(
    private modalService: ModalService,
    private clientStorageService: ClientStorageService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.serviceArray = [];
  }

  ngOnInit() {
    this.subscription.add(
      this.route.queryParamMap
        .pipe(
          switchMap((params) => {
            this.familyHeadId = params.get('familyId') ?? '';
            this.individualId = params.get('individualId') ?? '';
            this.familyMemberIds = this.individualId.split(',').map((id) => id.trim());
            this.membersLength = this.familyMemberIds.length;

            // Fetch the family members
            this.selectedMembers$ = from(
              this.clientStorageService.findMemberById(this.familyHeadId, this.familyMemberIds)
            );

            // Fetch the family head
            this.head$ = from(this.clientStorageService.fetchMemberByOid(this.familyHeadId)).pipe(map((head) => head));

            return forkJoin({
              selectedMembers: this.selectedMembers$,
              head: this.head$,
            }).pipe(map(({ selectedMembers, head }) => ({ selectedMembers, head })));
          })
        )
        .subscribe((data) => {
          if (data) {
            this.combinedData = data;
            this.singleMemberGender = data.selectedMembers?.[0]?.Sex;
            this.generateServiceArray();
          }
        })
    );
  }

  getGenderImage(number: number) {
    return `../../../../../assets/icon/gender/gender-${number}.png`;
  }

  // Open the health education modal
  // openHealthEducationWizard(item: any) {
  //   // console.log('in Health education wizard');
  //   if (this.combinedData.selectedMembers.length) {
  //     console.log(this.combinedData.selectedMembers);
  //     this.modalService.presentModal({
  //       component: HealthEducationWizardComponent,
  //       componentProps: {
  //         selectedMembers: this.combinedData.selectedMembers,
  //         head: this.combinedData.head,
  //       },
  //     });
  //   }
  // }

  // Generate the service array based on the selected members
  generateServiceArray() {
    this.serviceArray = ModalArray.filter((service) => {
      if (this.membersLength <= 1 && this.singleMemberGender == 2) {
        return (
          (service.category == ServiceListCategoryToShow.SINGLE && service.gender == 2) ||
          (service.category == ServiceListCategoryToShow.SINGLE && service.gender == 4) ||
          service.category == ServiceListCategoryToShow.BOTH
        );
      } else if (this.membersLength <= 1)
        return (
          (service.category == ServiceListCategoryToShow.SINGLE && service.gender == 4) ||
          service.category == ServiceListCategoryToShow.BOTH
        );
      else
        return (
          service.category == ServiceListCategoryToShow.MULTIPLE || service.category == ServiceListCategoryToShow.BOTH
        );
    });
  }

  // open wizard
  openWizard(item: ModalItem) {
    console.log(this.combinedData?.selectedMembers?.length);
    console.log(this.combinedData?.head);
    if (this.combinedData?.selectedMembers?.length && this.combinedData?.head) {
      let component;
      switch (item.id) {
        case 'health-education':
          component = HealthEducationWizardComponent;
          break;
        case 'anc':
          component = AncGroupWizardComponent;
          break;
        case 'family-planning':
          component = FamilyPlanningServiceWizardComponent;
          break;
        case 'child-health':
          component = ChildHealthGroupWizardComponent;
          break;
        case 'postnatal':
          component = PostnatalWizardComponent;
          break;

        case 'household-nutrition':
          component = HouseholdNutritionGroupWizardComponent;
          break;

        case 'hiv-services':
          component = HivGroupWizardComponent;
          break;

        case 'art':
          component = ARTWizardComponent;
          break;
        case 'tb-services':
          component = TbGroupWizardComponent;
          break;

        case 'malaria-services':
          component = MalariaGroupWizardComponent;
          break;
        case 'hbc':
          component = HBCGroupWizardComponent;
          break;
        case 'client-assessment':
          component = HBCClientAssessmentWizardComponent;
          break;
        case 'ncd':
          component = NcdGroupWizardComponent;
          break;
        default:
          component = null;
      }

      this.modalService.presentModal({
        component,
        componentProps: {
          children: item.children,
          head: this.combinedData.head,
          member: this.combinedData.selectedMembers,
        },
        cssClass: item.cssClass,
      });
    }
  }

  // Open the ANC initiation modal
  // openANCInitiationWizard() {
  //   if (this.combinedData.selectedMembers.length === 1) {
  //     this.modalService.presentModal({
  //       component: AncInitiationWizardComponent,
  //       componentProps: {
  //         head: this.combinedData.head,
  //         member: this.combinedData.selectedMembers[0],
  //       },
  //       cssClass: 'anc-initiation-wizard',
  //     });
  //   }
  // }

  // // Open the ANC discussed topics modal
  // openANCTopicsWizard() {
  //   this.modalService.presentModal({
  //     component: AncDiscussedTopicsWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'anc-discussed-topics-wizard',
  //   });
  // }
  // // Open the Family Planning Service  modal
  // openFamilyPlanningWizard() {
  //   this.modalService.presentModal({
  //     component: FamilyPlanningServiceWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'family-planning-service-wizard',
  //   });
  // }

  // // Open Child Growth Monitoring Modal
  // openChildGrowthMonitoringWizard() {
  //   this.modalService.presentModal({
  //     component: ChildGrowthMonitoringWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'child-growth-monitoring-wizard',
  //   });
  // }

  // // Open Child Immunization
  // openChildImmunizationWizard() {
  //   this.modalService.presentModal({
  //     component: ImmunizationWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'child-immunization-wizard',
  //   });
  // }

  // // Open Art Wizard
  // openARTWizard() {
  //   this.modalService.presentModal({
  //     component: ARTWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'art-wizard',
  //   });
  // }

  // // Open Malaria Prevention Wizard
  // openMalariaPreventionWizard() {
  //   this.modalService.presentModal({
  //     component: MalariaPreventionWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'malaria-prevention-wizard',
  //   });
  // }

  // // Open TB Discussed Topic Wizard
  // openTbDiscussedTopicWizard() {
  //   this.modalService.presentModal({
  //     component: TBDiscussedTopicWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'tb-discussed-topic-wizard',
  //   });
  // }

  // // Open ANC Group Wizard
  // openANCGroupWizard() {
  //   this.modalService.presentModal({
  //     component: AncGroupWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'anc-group-wizard',
  //   });
  // }

  // // Open Breastfeeding and Complimentary Feeding Modal
  // openBreastFeedingAndComplimentaryWizard() {
  //   this.modalService.presentModal({
  //     component: BreastfeedingAndComplimentaryWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'breastfeeding-and-complimentary-wizard',
  //   });
  // }

  // // Open minimum acceptable diet modal
  // openMinimumAcceptableDietWizard() {
  //   this.modalService.presentModal({
  //     component: MinimumAcceptableDietWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'minimum-acceptable-diet-wizard',
  //   });
  // }

  // // Open Dietary Diversity Wizard
  // openDietaryDiversityWizard() {
  //   this.modalService.presentModal({
  //     component: DietaryDiversityWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'dietary-diversity-wizard',
  //   });
  // }

  // // Open House Hold Nutrition Wizard
  // openHouseholdNutritionWizard() {
  //   this.modalService.presentModal({
  //     component: HouseholdNutritionGroupWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'household-nutrition-wizard',
  //   });
  // }

  // // Open HIV group Wizard
  // openHIVGroupWizard() {
  //   this.modalService.presentModal({
  //     component: HivGroupWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'hiv-group-wizard',
  //   });
  // }

  // // Open Child Health Group Wizard
  // openChildHealthGroupWizard() {
  //   this.modalService.presentModal({
  //     component: ChildHealthGroupWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'child-health-group-wizard',
  //   });
  // }

  // // Open self test Wizard
  // openSelfTestWizard() {
  //   this.modalService.presentModal({
  //     component: SelfTestWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'self-test-wizard',
  //   });
  // }

  // // Open TB Group Service Wizard
  // openTbGroupServiceWizard() {
  //   this.modalService.presentModal({
  //     component: TbGroupWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'tb-group-wizard',
  //   });
  // }

  // // Open Counseling Wizard
  // openHIVCounsellingWizard() {
  //   this.modalService.presentModal({
  //     component: HivCounselingWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'counseling-wizard',
  //   });
  // }

  // // Open Self Test Usability Wizard
  // openSelfTestUsabilityWizard() {
  //   this.modalService.presentModal({
  //     component: SelfTestUsabilityWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'self-test-usability-wizard',
  //   });
  // }

  // // Open HBC Client Assessment Wizard
  // openHBCClientAssessmentWizard() {
  //   this.modalService.presentModal({
  //     component: HBCClientAssessmentWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'hbc-client-assessment-wizard',
  //   });
  // }

  // // Open Infection Control Assessment Wizard
  // openInfectionControlAssessmentWizard() {
  //   this.modalService.presentModal({
  //     component: InfectionControlAssessmentWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'infection-control-assessment-wizard',
  //   });
  // }

  // // Open Symptoms Screening Wizard
  // openSymptomsScreeningWizard() {
  //   this.modalService.presentModal({
  //     component: SymptomsScreeningWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'symptoms-screening-wizard',
  //   });
  // }

  // // Open TB Environment Assessment Wizard
  // openTbEnvironmentAssessmentWizard() {
  //   this.modalService.presentModal({
  //     component: TbEnvironmentAssessmentWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'tb-environment-assessment-wizard',
  //   });
  // }

  // // Open Malaria Risk Wizard
  // openMalariaRiskWizard() {
  //   this.modalService.presentModal({
  //     component: MalariaRiskWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'malaria-risk-wizard',
  //   });
  // }
  // // Open Malaria Symptoms Wizard
  // openMalariaSymptomsWizard() {
  //   this.modalService.presentModal({
  //     component: MalariaSymptomsWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'malaria-symptoms-wizard',
  //   });
  // }

  // // Open Malaria Household Control Intervention Wizard
  // openHouseholdControlInterventionWizard() {
  //   this.modalService.presentModal({
  //     component: HouseholdControlInterventionWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'household-control-intervention-wizard',
  //   });
  // }

  // // Open Malaria Case Finding Wizard
  // openMalariaCaseFindingWizard() {
  //   this.modalService.presentModal({
  //     component: MalariaCaseFindingWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'malaria-case-finding-wizard',
  //   });
  // }

  // // Open HBC Group Service Wizard
  // openHBCGroupServiceWizard() {
  //   this.modalService.presentModal({
  //     component: HBCGroupWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'hbc-group-service-wizard',
  //   });
  // }

  // // Open NCD history Wizard
  // openNCDHistoryWizard() {
  //   this.modalService.presentModal({
  //     component: NCDHistoryWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'ncd-history-wizard',
  //   });
  // }
  // // Open NCD screening Wizard
  // openNCDScreeningWizard() {
  //   this.modalService.presentModal({
  //     component: NCDScreeningWizardComponent,
  //     componentProps: {
  //       head: this.combinedData.head,
  //       member: this.combinedData.selectedMembers[0],
  //     },
  //     cssClass: 'ncd-screening-wizard',
  //   });
  // }

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

  // Get relation type
  getRelationType(relationTypeId: number) {
    return this.relationTypeOptions.find((relationType) => relationType.value === relationTypeId)?.key;
  }

  // Unsubscribe from the Observables
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
