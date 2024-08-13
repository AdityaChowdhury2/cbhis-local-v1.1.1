import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClientPageRoutingModule } from './client-routing.module';
import { ClientPage } from './client.page';
import { HeaderComponent } from './components/header/header.component';
import { HouseholdControlInterventionWizardComponent } from './components/household-control-intervention-wizard/household-control-intervention-wizard.component';
import { MalariaCaseFindingWizardComponent } from './components/malaria-case-finding-wizard/malaria-case-finding-wizard.component';
import { MalariaRiskWizardComponent } from './components/malaria-risk-wizard/malaria-risk-wizard.component';
import { MalariaSymptomsWizardComponent } from './components/malaria-symptoms-wizard/malaria-symptoms-wizard.component';
import { AddClientWizardComponent } from './components/modals/add-client-wizard/add-client-wizard.component';
import { AddDependentWizardComponent } from './components/modals/add-dependent-wizard/add-dependent-wizard.component';
import { AddGroupServiceWizardComponent } from './components/modals/add-group-service-wizard/add-group-service-wizard.component';
import { ARTWizardComponent } from './components/modals/art-wizard/art-wizard.component';
import { BreastfeedingAndComplimentaryWizardComponent } from './components/modals/breastfeeding-and-complimentary-wizard/breastfeeding-and-complimentary-wizard.component';
import { ChangePasswordWizardComponent } from './components/modals/change-password-wizard/change-password-wizard.component';
import { CreateAppointmentWithHeadWizardComponent } from './components/modals/create-appointment-with-head-wizard/create-appointment-with-head-wizard.component';
import { DietaryDiversityWizardComponent } from './components/modals/dietary-diversity-wizard/dietary-diversity-wizard.component';
import { JobAidPopoverComponent } from './components/modals/job-aid-popover/job-aid-popover.component';
import { MalariaPreventionWizardComponent } from './components/modals/malaria-prevention-wizard/malaria-prevention-wizard.component';
import { MinimumAcceptableDietWizardComponent } from './components/modals/minimum-acceptable-diet-wizard/minimum-acceptable-diet-wizard.component';
import { NCDHistoryWizardComponent } from './components/modals/ncd-history-wizard/ncd-history-wizard.component';
import { NCDScreeningWizardComponent } from './components/modals/ncd-screening-wizard/ncd-screening-wizard.component';
import { RescheduleWizardComponent } from './components/modals/reschedule-wizard/reschedule-wizard.component';
import { SelfTestUsabilityWizardComponent } from './components/modals/self-test-usability-wizard/self-test-usability-wizard.component';
import { AncDiscussedTopicsWizardComponent } from './components/modals/service-modals/anc/anc-discussed-topics-wizard/anc-discussed-topics-wizard.component';
import { AncGroupWizardComponent } from './components/modals/service-modals/anc/anc-group-wizard/anc-group-wizard.component';
import { AncInitiationWizardComponent } from './components/modals/service-modals/anc/anc-initiation-wizard/anc-initiation-wizard.component';
import { AdverseEventWizardComponent } from './components/modals/service-modals/child-health/adverse-event-wizard/adverse-event-wizard.component';
import { ChildGrowthMonitoringWizardComponent } from './components/modals/service-modals/child-health/child-growth-monitoring-wizard/child-growth-monitoring-wizard.component';
import { ChildHealthGroupWizardComponent } from './components/modals/service-modals/child-health/child-health-group-wizard/child-health-group-wizard.component';
import { ImmunizationWizardComponent } from './components/modals/service-modals/child-health/immunization-wizard/immunization-wizard.component';
import { FamilyPlanningServiceWizardComponent } from './components/modals/service-modals/family-planning-service-wizard/family-planning-service-wizard.component';
import { HBCClientAssessmentWizardComponent } from './components/modals/service-modals/hbc/hbc-client-assessment-wizard/hbc-client-assessment-wizard.component';
import { HBCGroupWizardComponent } from './components/modals/service-modals/hbc/hbc-group-wizard/hbc-group-wizard.component';
import { HbcServicesWizardComponent } from './components/modals/service-modals/hbc/hbc-services-wizard/hbc-services-wizard.component';
import { HealthEducationWizardComponent } from './components/modals/service-modals/health-education-wizard/health-education-wizard.component';
import { HivCounselingWizardComponent } from './components/modals/service-modals/hiv/hiv-counseling-wizard/hiv-counseling-wizard.component';
import { HivGroupWizardComponent } from './components/modals/service-modals/hiv/hiv-group-wizard/hiv-group-wizard.component';
import { SelfTestWizardComponent } from './components/modals/service-modals/hiv/self-test-wizard/self-test-wizard.component';
import { HouseholdNutritionGroupWizardComponent } from './components/modals/service-modals/household-nutrition/household-nutrition-group-wizard/household-nutrition-group-wizard.component';
import { MalariaGroupWizardComponent } from './components/modals/service-modals/malaria/malaria-group-wizard/malaria-group-wizard.component';
import { NcdGroupWizardComponent } from './components/modals/service-modals/ncd/ncd-group-wizard/ncd-group-wizard.component';
import { PostnatalDangerWizardComponent } from './components/modals/service-modals/postnatal/postnatal-danger-wizard/postnatal-danger-wizard.component';
import { PostnatalDepressionsWizardComponent } from './components/modals/service-modals/postnatal/postnatal-depressions-wizard/postnatal-depressions-wizard.component';
import { PostnatalFeedingWizardComponent } from './components/modals/service-modals/postnatal/postnatal-feeding-wizard/postnatal-feeding-wizard.component';
import { PostnatalPreventionWizardComponent } from './components/modals/service-modals/postnatal/postnatal-prevention-wizard/postnatal-prevention-wizard.component';
import { PostnatalWizardComponent } from './components/modals/service-modals/postnatal/postnatal-wizard/postnatal-wizard.component';
import { InfectionControlAssessmentWizardComponent } from './components/modals/service-modals/tb/infection-control-assessment-wizard/infection-control-assessment-wizard.component';
import { SymptomsScreeningWizardComponent } from './components/modals/service-modals/tb/symptoms-screening-wizard/symptoms-screening-wizard.component';
import { TBDiscussedTopicWizardComponent } from './components/modals/service-modals/tb/tb-discussed-topic-wizard/tb-discussed-topic-wizard.component';
import { TbEnvironmentAssessmentWizardComponent } from './components/modals/service-modals/tb/tb-environment-assessment-wizard/tb-environment-assessment-wizard.component';
import { TbGroupWizardComponent } from './components/modals/service-modals/tb/tb-group-wizard/tb-group-wizard.component';
import { SyncModalWizardComponent } from './components/sync-modal-wizard/sync-modal-wizard.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { FamilyDetailsComponent } from './pages/family-details/family-details.component';
import { SearchComponent } from './pages/search/search.component';
import { ServicePointsComponent } from './pages/service-points/service-points.component';
import { SettingsComponent } from './pages/settings/settings.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ClientPageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [
    // Client Page Component
    ClientPage,
    // Pages
    SearchComponent,
    SettingsComponent,
    FamilyDetailsComponent,
    ChangePasswordComponent,
    ServicePointsComponent,
    // Other Components
    HeaderComponent,
    // Modals
    SyncModalWizardComponent,
    RescheduleWizardComponent,
    AddClientWizardComponent,
    CreateAppointmentWithHeadWizardComponent,
    AddDependentWizardComponent,
    // Environment service modal
    AddGroupServiceWizardComponent,
    // *Service modals*
    HealthEducationWizardComponent,
    FamilyPlanningServiceWizardComponent,
    // Postnatal modals
    PostnatalDangerWizardComponent,
    PostnatalDepressionsWizardComponent,
    PostnatalFeedingWizardComponent,
    PostnatalPreventionWizardComponent,
    PostnatalWizardComponent,
    // Anc group modals
    AncGroupWizardComponent,
    AncInitiationWizardComponent,
    AncDiscussedTopicsWizardComponent,

    // Child health group modals
    ChildHealthGroupWizardComponent,
    ChildGrowthMonitoringWizardComponent,
    ImmunizationWizardComponent,
    AdverseEventWizardComponent,

    // Household nutrition group modals
    MinimumAcceptableDietWizardComponent,
    BreastfeedingAndComplimentaryWizardComponent,
    DietaryDiversityWizardComponent,
    HouseholdNutritionGroupWizardComponent,

    // Hiv group modals
    HivGroupWizardComponent,
    SelfTestWizardComponent,
    HivCounselingWizardComponent,

    // Tb group modals
    TbGroupWizardComponent,
    InfectionControlAssessmentWizardComponent,
    SymptomsScreeningWizardComponent,
    TbEnvironmentAssessmentWizardComponent,
    TBDiscussedTopicWizardComponent,

    // Malaria Group Modal
    MalariaGroupWizardComponent,
    MalariaCaseFindingWizardComponent,
    MalariaSymptomsWizardComponent,
    MalariaRiskWizardComponent,
    MalariaPreventionWizardComponent,

    // HBC Group Modal
    HBCGroupWizardComponent,
    HbcServicesWizardComponent,
    HBCClientAssessmentWizardComponent,

    // NCD Group Modal
    NcdGroupWizardComponent,
    NCDHistoryWizardComponent,
    NCDScreeningWizardComponent,

    HouseholdControlInterventionWizardComponent,
    ARTWizardComponent,

    SelfTestUsabilityWizardComponent,
    JobAidPopoverComponent,
    ChangePasswordWizardComponent,
  ],
})
export class ClientPageModule {}
