import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserStorageService } from 'src/app/modules/auth/services/user-storage.service';
import { TableCode } from 'src/app/shared/enums/table-code.enum';
import { resObj } from 'src/app/shared/models/api-res';
import { AppointmentResponse } from 'src/app/shared/models/appointment';
import { Root } from 'src/app/shared/models/online-format';
import { SyncApiResponse, SyncApiResponseData } from 'src/app/shared/models/upload-state';
import { DbStorageService } from 'src/app/shared/services/database/db-storage.service';
import { DeviceService } from 'src/app/shared/services/device.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { NetworkService } from 'src/app/shared/services/network.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { environment } from 'src/environments/environment';
import { ChangePasswordWizardComponent } from '../../components/modals/change-password-wizard/change-password-wizard.component';
import { SyncModalWizardComponent } from '../../components/sync-modal-wizard/sync-modal-wizard.component';
import { AppointmentStorageService } from '../../services/appointment-storage.service';
import { ClientStorageService } from '../../services/client-storage.service';
import { VillageStorageService } from '../../services/village-storage.service';
import { ToastService } from './../../../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  isLookupSyncLoading: boolean = false;
  isLookupSynced: boolean = false;
  isDeviceOnline: boolean = false;

  english = false;
  texts = {} as {
    title: string;
  };

  @Optional() private routerOutlet?: IonRouterOutlet;

  constructor(
    private syncStorageService: SyncStorageService,
    private authService: AuthService,
    private router: Router,
    private httpService: HttpClient,
    private storageService: DbStorageService,
    private toastService: ToastService,
    private villageStorageService: VillageStorageService,
    private appointmentStorageService: AppointmentStorageService,
    private userStorageService: UserStorageService,
    private deviceService: DeviceService,
    private clientStorageService: ClientStorageService,
    private modalService: ModalService,
    private networkService: NetworkService,
    private cd: ChangeDetectorRef,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    // of(this.languageService.test()).subscribe((data) => {
    //   console.log(data);
    //   this.texts = data;
    //   this.cd.detectChanges();
    // });

    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });

    this.villageStorageService.fetchVillage().subscribe((villages) => {
      console.log(' villages in add client wizard ', villages);
      if (villages.length) {
        this.isLookupSynced = true;
      }
    });

    this.networkService.networkStatus$.subscribe((data) => {
      this.isDeviceOnline = data.connected;
      this.cd.detectChanges();
    });
  }

  // * for changing password
  onChangePasswordClick() {
    // this.router.navigate(['client/change-password']);
    this.modalService.presentModal({
      component: ChangePasswordWizardComponent,
      cssClass: 'change-password-modal',
    });
  }

  // * for logout a user
  async logout() {
    await this.authService.logout();
    this.router.navigate(['auth/sign-in']);
  }

  async onAppointmentClick() {
    try {
      console.log('Appoint clicked');

      // Fetch villages
      const villages = await firstValueFrom(this.villageStorageService.fetchVillage());

      // Get current user
      const user = await firstValueFrom(this.authService.getCurrentUser());
      console.log(user);

      if (user?.AssignedVillages) {
        const assignedVillages = JSON.parse(JSON.parse(user.AssignedVillages));
        console.log(assignedVillages);
        const assignedVillageIds = assignedVillages?.map((village: any) => village.villageId);
        const villageOids = villages.map((village) => village.Oid);
        console.log('villages', villages);

        const isMatch = assignedVillageIds.some((villageId: number) => villageOids.includes(villageId));
        console.log('isMatch', isMatch);

        if (isMatch) {
          this.router.navigate(['client/search']);
        } else {
          this.toastService.openToast({
            message: 'You need to sync first.',
            color: 'danger',
            duration: 3000,
          });
        }
      } else {
        throw new Error('User has no assigned villages');
      }
    } catch (error) {
      console.error('Error on appointment click:', error);
      this.toastService.openToast({
        message: 'An error occurred. Please try again later.',
        color: 'danger',
        duration: 1000,
      });
    }
  }

  // async onAppointmentClick() {
  //   this.villageStorageService.fetchVillage().subscribe((villages) => {
  //     console.log('Villages on appointment click:', villages);
  //     this.authService.getCurrentUser().subscribe((user) => {
  //       console.log(user);
  //       if (user?.AssignedVillages) {
  //         let assignedVillages = JSON.parse(JSON.parse(user.AssignedVillages));
  //         console.log('Assigned Villages:', assignedVillages);
  //         console.log('Assigned Villages:', assignedVillages?.villageId);
  //         console.log([...villages.map((village) => village.Oid)]);
  //         if ([...villages.map((village) => village.Oid)].includes(assignedVillages?.villageId)) {
  //           this.router.navigate(['client/appointment']);
  //         }
  //       }
  //     });
  //   });
  // }

  async onSyncClick_test() {
    console.log('Sync clicked');
    const res = await this.syncStorageService.getAllTransactionsFromQueue();
    console.log('SyncQueue:', res);
    const filterUserAccountTable = res.filter((data) => data.tableCode !== 45);
  }

  // * thi function is for local test
  async _handleSync() {
    console.log('IN SYNC CLICK');

    try {
      const deviceInfo = (await this.deviceService.getDeviceId()).identifier;
      // const deviceInfo = 'de708e4b-9982-443f-a2f3-712d5987f3b8';
      // const deviceInfo = 'a5f4572c5026632c';
      console.log('calling handle sync button');

      const res = resObj;

      console.log('Response:', res);

      const { isSuccess, data } = res || {};
      if (isSuccess) {
        await this.storageService.clearLookupTables();

        await this.storageService.clearAndInsertInRegionTable(data.regions);

        await this.storageService.clearAndInsertInTinkhundlaTable(data.tinkhundlas);

        await this.storageService.clearAndInsertInChiefdomTable(data.chiefdoms);

        await this.storageService.clearAndInsertInVillageTable(data.villages).then(() => {
          this.villageStorageService.getVillages().then(() => {
            console.log('Villages inserted successfully');
          });
        });

        // insert anc topic data
        await this.storageService.syncANCTopicData(data.ancTopics);

        // insert drink water source data
        await this.storageService.syncDrinkWaterSourceData(data.drinkWaterSources);

        // insert safe water source data
        await this.storageService.syncSafeWaterSourceData(data.safeWaterSources);

        // insert washes data
        await this.storageService.syncWASHData(data.washes);

        // insert health education topic
        await this.storageService.syncHealthEducationTopicData(data.healthEducationTopics);

        // insert family planning method data
        await this.storageService.syncFPMethodData(data.fpMethods);

        // insert malaria control intervention data
        await this.storageService.syncMalariaControlIntervention(data.malariaControlInterventions);

        // insert minimum acceptable diet data
        await this.storageService.syncMinimumAcceptableDiet(data.minimumAcceptableDiets);

        // insert malaria symptom data
        await this.storageService.syncMalariaSymptoms(data.malariaSymptoms);

        // insert malaria risk factor data
        await this.storageService.syncMalariaRiskData(data.malariaRisks);

        // insert hbc service data
        await this.storageService.syncHBCService(data.hbcServices);

        // insert hbc service category data
        await this.storageService.syncServiceCategory(data.serviceCategories);

        // insert tb education topic data
        await this.storageService.syncTBEducationTopic(data.tbEducationTopics);

        // insert hiv preventative service data
        await this.storageService.syncHIVPreventativeService(data.hivPreventativeServices);

        // insert ncd condition data
        await this.storageService.syncNCDCondition(data.ncdConditions);

        // insert danger sign data
        await this.storageService.syncDangerSignData(data.dangerSigns);

        // insert postpartum depression data
        await this.storageService.syncPostpartumDepressionData(data.postpartumDepressions);

        // insert feeding methods
        await this.storageService.syncFeedingMethodData(data.feedingMethods);

        // insert diet diversity data
        await this.storageService.syncDietaryDiversityData(data.dietaryDiversities);

        // insert adverse event data
        await this.storageService.syncAdverseEventData(data.adverseEvents);

        // insert tb symptom data
        await this.storageService.syncTBSymptomData(data.tbSymptoms);

        // insert tb control assessment data
        await this.storageService.syncTBControlAssessment(data.tbControlAssessments);

        // insert tb environment assessment data
        await this.storageService.syncTBEnvironmentalAssessment(data.tbEnvironmentalAssessments);

        // insert breastfeeding data
        await this.storageService.syncBreastfeedingAndComplementaryFeeding(data.breastfeedingAndComplimentaryFeedings);

        this.isLookupSynced = true;
      } else {
        console.log('Error:', res);
      }
    } catch (error) {
      console.log('error in sync', error);
    }
  }

  async onSyncClick() {
    console.log('Sync clicked');

    // Retrieve all transactions from the sync queue
    const res = await this.syncStorageService.getAllTransactionsFromQueue();
    console.log('SyncQueue:', res);

    // Filter out transactions from a specific table
    const filterUserAccountTable = res.filter((data) => data.tableCode !== 45);

    if (res.length > 0) {
      try {
        // Send the filtered transactions to the server for synchronization
        const response: SyncApiResponse | undefined = await this.httpService
          .post<SyncApiResponse>(`${environment.baseUrl}update-state`, filterUserAccountTable, {
            headers: {
              'Content-Type': 'application/json',
              'No-Auth': 'True',
              Authorization: 'Bearer Jl7Fl8Ee64w=',
            },
          })
          .toPromise();

        console.log('Response:', response);

        // If the synchronization is successful
        if (response?.isSuccess) {
          console.log('Sync response data ===>', response.data);

          // Loop through the response data
          if (response?.data.length > 0) {
            for (const element of response.data) {
              console.log(element);

              // Handle ANC table updates
              if (element.tableCode === TableCode['ANC']) {
                await this.storageService.updateANCItem(element.transactionId as string, element.anc);
                await this.handleOperation(element, 'ANC', element.anc?.transactionId, element.anc?.onlineDbOid);
              }

              // Handle FamilyPlan table updates
              if (element.tableCode === TableCode['FamilyPlan']) {
                await this.storageService.updateFamilyPlanItem(element.transactionId, element.familyPlans);
                await this.handleOperation(
                  element,
                  'FamilyPlan',
                  element.familyPlans?.transactionId,
                  element.familyPlans?.onlineDbOid
                );
              }

              // Handle ChildGrowthMonitoring table updates
              if (element.tableCode === TableCode['ChildGrowthMonitoring']) {
                console.log('In ChildGrowthMonitoring', element.transactionId, element.childGrowthMonitorings);
                await this.storageService.updateChildGrowthMonitoringItem(
                  element.transactionId,
                  element.childGrowthMonitorings
                );
                await this.handleOperation(
                  element,
                  'ChildGrowthMonitoring',
                  element.childGrowthMonitorings?.transactionId,
                  element.childGrowthMonitorings?.onlineDbOid
                );
              }

              // Handle ClientMinimumAcceptableDiet table updates
              if (element.tableCode === TableCode['ClientMinimumAcceptableDiet']) {
                await this.storageService.updateClientMinimumAcceptableDietItem(
                  element.transactionId,
                  element.clientMinimumAcceptableDiets
                );
                await this.handleOperation(
                  element,
                  'ClientMinimumAcceptableDiet',
                  element.clientMinimumAcceptableDiets?.transactionId,
                  element.clientMinimumAcceptableDiets?.onlineDbOid
                );
              }

              // Handle Counseling table updates
              if (element.tableCode === TableCode['Counseling']) {
                await this.storageService.updateCounselingItem(element.transactionId, element.counselings);
                await this.handleOperation(
                  element,
                  'Counseling',
                  element.counselings?.transactionId,
                  element.counselings?.onlineDbOid
                );
              }

              // Handle HIVSelfTest table updates
              if (element.tableCode === TableCode['HIVSelfTest']) {
                await this.storageService.updateHIVSelfTestItem(element.transactionId, element.hivSelfTests);
                await this.handleOperation(
                  element,
                  'HIVSelfTest',
                  element.hivSelfTests?.transactionId,
                  element.hivSelfTests?.onlineDbOid
                );
              }

              // Handle ARTClient table updates
              if (element.tableCode === TableCode['ARTClient']) {
                await this.storageService.updateARTClientItem(element.transactionId, element.artClients);
                await this.handleOperation(
                  element,
                  'ARTClient',
                  element.artClients?.transactionId,
                  element.artClients?.onlineDbOid
                );
              }

              // Handle ClientTBSymptom table updates
              if (element.tableCode === TableCode['ClientTBSymptom']) {
                await this.storageService.updateClientTBSymptomItem(element.transactionId, element.clientTBSymptoms);
                await this.handleOperation(
                  element,
                  'ClientTBSymptom',
                  element.clientTBSymptoms?.transactionId,
                  element.clientTBSymptoms?.onlineDbOid
                );
              }

              // Handle ClientTBEnvironmentalAssessment table updates
              if (element.tableCode === TableCode['ClientTBEnvironmentalAssessment']) {
                await this.storageService.updateClientTBEnvironmentalAssessmentItem(
                  element.transactionId,
                  element.clientTBEnvironmentalAssessments
                );
                await this.handleOperation(
                  element,
                  'ClientTBEnvironmentalAssessment',
                  element.clientTBEnvironmentalAssessments?.transactionId,
                  element.clientTBEnvironmentalAssessments?.onlineDbOid
                );
              }

              // Handle MalariaCaseFinding table updates
              if (element.tableCode === TableCode['MalariaCaseFinding']) {
                await this.storageService.updateMalariaCaseFindingItem(
                  element.transactionId,
                  element.malariaCaseFinding
                );
                await this.handleOperation(
                  element,
                  'MalariaCaseFinding',
                  element.malariaCaseFinding?.transactionId,
                  element.malariaCaseFinding?.onlineDbOid
                );
              }

              // Handle MalariaPrevention table updates
              if (element.tableCode === TableCode['MalariaPrevention']) {
                await this.storageService.updateMalariaPreventionItem(element.transactionId, element.malariaPrevention);
                await this.handleOperation(
                  element,
                  'MalariaPrevention',
                  element.malariaPrevention?.transactionId,
                  element.malariaPrevention?.onlineDbOid
                );
              }

              // Handle HouseholdControlIntervention table updates
              if (element.tableCode === TableCode['HouseholdControlIntervention']) {
                await this.storageService.updateHouseholdControlInterventionItem(
                  element.transactionId,
                  element.householdControlIntervention
                );
                await this.handleOperation(
                  element,
                  'HouseholdControlIntervention',
                  element.householdControlIntervention?.transactionId,
                  element.householdControlIntervention?.onlineDbOid
                );
              }

              // Handle HBCClientAssessment table updates
              if (element.tableCode === TableCode['HBCClientAssessment']) {
                await this.storageService.updateHBCClientAssessmentItem(
                  element.transactionId,
                  element.hbcClientAssessment
                );
                await this.handleOperation(
                  element,
                  'HBCClientAssessment',
                  element.hbcClientAssessment?.transactionId,
                  element.hbcClientAssessment?.onlineDbOid
                );
              }

              // Handle ClientNCDHistory table updates
              if (element.tableCode === TableCode['ClientNCDHistory']) {
                await this.storageService.updateClientNCDHistoryItem(element.transactionId, element.clientNCDHistorie);
                await this.handleOperation(
                  element,
                  'ClientNCDHistory',
                  element.clientNCDHistorie?.transactionId,
                  element.clientNCDHistorie?.onlineDbOid
                );
              }

              // Handle ChildImmunization table updates
              if (element.tableCode === TableCode['ChildImmunization']) {
                await this.storageService.updateChildImmunizationItem(
                  element.transactionId,
                  element.childImmunizations
                );
                await this.handleOperationForImmunization(element);
              }

              // Handle PostNatal table updates
              if (element.tableCode === TableCode['PostNatal']) {
                await this.storageService.updatePostNatalItem(element.transactionId, element.postNatals);
                await this.handleOperationForPostNatal(element);
              }

              // Handle Client table updates
              if (element.tableCode === TableCode['Client']) {
                if (element.clients?.oid) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId('Client', element.clients?.oid);
                }
              }

              // Handle multi-select services
              await this.handleMultiSelectServices(element);
            }
          }

          // Notify the user of successful synchronization

          this.toastService.openToast({
            message: this.english ? `Data synced successfully` : 'Emafayela sekakhona',
            position: 'bottom',
            duration: 1000,
            color: 'success',
          });
          console.log('Data synced successfully', await this.syncStorageService.getAllTransactionsFromQueue_Old());
        } else {
          // Notify the user if synchronization failed

          this.toastService.openToast({
            message: 'Data synchronization failed',
            position: 'bottom',
            duration: 1000,
            color: 'danger',
          });
        }
      } catch (error) {
        console.error('Error during sync:', error);
      } finally {
      }
    } else {
      // Uncomment below to notify the user if there is no data to sync
      // this.toastService.openToast({
      //   message: `No data to sync`,
      //   position: 'bottom',
      //   duration: 1000,
      //   color: 'danger',
      // });
    }
  }

  /**
   * Handles the operation for a given element, updating or deleting items based on the operation type.
   * @param element The response element containing operation details.
   * @param tableName The name of the table.
   * @param transactionId The transaction ID of the item.
   * @param onlineDbOid The online database OID of the item.
   */
  private async handleOperation(
    element: SyncApiResponseData,
    tableName: string,
    transactionId: string,
    onlineDbOid: string
  ) {
    if (element.operation) {
      if (element.operation === 1 && transactionId) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(tableName, transactionId);
      }
      if (element.operation === 3 && transactionId) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(tableName, onlineDbOid);
      }
    }
  }

  /**
   * Handles the operation specifically for ChildImmunization items.
   * @param element The response element containing ChildImmunization details.
   */
  private async handleOperationForImmunization(element: SyncApiResponseData) {
    await this.handleOperation(
      element,
      'ChildImmunization',
      element.childImmunizations?.transactionId,
      element.childImmunizations?.onlineDbOid
    );
    if (element.childImmunizations?.immunizationAdverseEvents.length) {
      for (let events of element.childImmunizations?.immunizationAdverseEvents) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(
          'ImmunizationAdverseEvent',
          events.transactionId
        );
      }
    }
  }

  /**
   * Handles the operation specifically for PostNatal items.
   * @param element The response element containing PostNatal details.
   */
  private async handleOperationForPostNatal(element: SyncApiResponseData) {
    await this.handleOperation(
      element,
      'PostNatal',
      element.postNatals?.transactionId,
      element.postNatals?.onlineDbOid
    );
    if (element.postNatals?.postNatalDangerSigns?.length) {
      for (let dangerSign of element.postNatals?.postNatalDangerSigns) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(
          'PostNatalDangerSign',
          dangerSign.transactionId
        );
      }
    }
    if (element.postNatals?.postNatalDepressions?.length) {
      for (let depression of element.postNatals?.postNatalDepressions) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(
          'PostNatalDepression',
          depression.transactionId
        );
      }
    }
    if (element.postNatals?.postNatalFeedingMethods?.length) {
      for (let feedingMethod of element.postNatals?.postNatalFeedingMethods) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(
          'PostNatalFeedingMethod',
          feedingMethod.transactionId
        );
      }
    }
    if (element.postNatals?.postNatalPreventativeServices?.length) {
      for (let service of element.postNatals?.postNatalPreventativeServices) {
        await this.syncStorageService.deleteQueueByTableAndTransactionId(
          'PostNatalPreventativeService',
          service.transactionId
        );
      }
    }
  }

  /**
   * Handles the deletion of multi-select services.
   * @param element The response element containing multi-select service details.
   */
  private async handleMultiSelectServices(element: SyncApiResponseData) {
    const multiSelectServices: { code: number; item: any }[] = [
      { code: TableCode.DiscussedANCTopic, item: element.discussedANCTopics },
      { code: TableCode.DiscussedTopic, item: element.discussedTopics },
      { code: TableCode.UsedFamilyPlanMethod, item: element.usedFamilyPlanMethods },
      { code: TableCode.HouseholdDietaryDiversity, item: element.householdDietaryDiversities },
      { code: TableCode.ClientBCF, item: element.clientBCFs },
      { code: TableCode.TBDiscussedTopic, item: element.tbDiscussedTopics },
      { code: TableCode.TBKeyAffectedClient, item: element.tbKeyAffectedClients },
      { code: TableCode.HouseholdMalariaRisk, item: element.householdMalariaRisk },
      { code: TableCode.ClientMalariaSymptom, item: element.clientMalariaSymptom },
      { code: TableCode.GivenHBCService, item: element.givenHBCService },
      { code: TableCode.HouseholdDrinkingWater, item: element.householdDrinkingWaters },
      { code: TableCode.HouseholdSafeWaterSource, item: element.householdSafeWaterSources },
      { code: TableCode.HouseholdWASH, item: element.householdWASHs },
    ];

    for (const service of multiSelectServices) {
      if (element.tableCode === service.code) {
        const serviceKey = this.getEnumKeyByEnumValue(TableCode, service.code);
        if (service.item?.transactionId && serviceKey) {
          await this.syncStorageService.deleteQueueByTableAndTransactionId(serviceKey, service.item.transactionId);
        }
      }
    }
  }

  private getEnumKeyByEnumValue(enumObj: any, value: number | string): string | undefined {
    return Object.keys(enumObj).find((key) => enumObj[key] === value);
  }

  // * handle download sync button
  async handleSync() {
    console.log('IN SYNC CLICK');

    try {
      const deviceInfo = (await this.deviceService.getDeviceId()).identifier;
      console.log('calling handle sync button');

      const res = await this.httpService
        .get<Root>(`${environment.baseUrl}download-states?deviceId=${deviceInfo}`, {
          headers: {
            'Content-Type': 'application/json',
            'No-Auth': 'True',
            Authorization: 'Bearer Jl7Fl8Ee64w=',
          },
        })
        .toPromise();

      const { isSuccess, data } = res || {};
      if (isSuccess && data) {
        await this.storageService.clearAndInsertInRegionTable(data.regions);
        await this.storageService.clearAndInsertInTinkhundlaTable(data.tinkhundlas);
        await this.storageService.clearAndInsertInChiefdomTable(data.chiefdoms);
        await this.storageService.clearAndInsertInVillageTable(data.villages);
        await this.villageStorageService.getVillages();
        await this.storageService.syncANCTopicData(data.ancTopics);
        await this.storageService.syncDrinkWaterSourceData(data.drinkWaterSources);
        await this.storageService.syncSafeWaterSourceData(data.safeWaterSources);
        await this.storageService.syncWASHData(data.washes);
        await this.storageService.syncHealthEducationTopicData(data.healthEducationTopics);
        await this.storageService.syncFPMethodData(data.fpMethods);
        await this.storageService.syncMalariaControlIntervention(data.malariaControlInterventions);
        await this.storageService.syncMinimumAcceptableDiet(data.minimumAcceptableDiets);
        await this.storageService.syncMalariaSymptoms(data.malariaSymptoms);
        await this.storageService.syncMalariaRiskData(data.malariaRisks);
        await this.storageService.syncHBCService(data.hbcServices);
        await this.storageService.syncServiceCategory(data.serviceCategories);
        await this.storageService.syncTBEducationTopic(data.tbEducationTopics);
        await this.storageService.syncHIVPreventativeService(data.hivPreventativeServices);
        await this.storageService.syncNCDCondition(data.ncdConditions);
        await this.storageService.syncDangerSignData(data.dangerSigns);
        await this.storageService.syncPostpartumDepressionData(data.postpartumDepressions);
        await this.storageService.syncFeedingMethodData(data.feedingMethods);
        await this.storageService.syncDietaryDiversityData(data.dietaryDiversities);
        await this.storageService.syncAdverseEventData(data.adverseEvents);
        await this.storageService.syncTBSymptomData(data.tbSymptoms);
        await this.storageService.syncTBControlAssessment(data.tbControlAssessments);
        await this.storageService.syncTBEnvironmentalAssessment(data.tbEnvironmentalAssessments);
        await this.storageService.syncBreastfeedingAndComplementaryFeeding(data.breastfeedingAndComplimentaryFeedings);

        console.log('Villages inserted successfully');
        await this.toastService.openToast({
          message: this.english ? `Data synced successfully` : 'Emafayela sekakhona',
          position: 'bottom',
          duration: 1000,
          color: 'success',
        });
        this.isLookupSynced = true;
      } else {
        console.log('Error:', res);
      }
    } catch (error) {
      console.log('error in sync', error);
    }
  }

  // * handle appointment sync
  async handleAppointmentSync() {
    const responseUser = await this.userStorageService.findLastCreatedUser();
    const deviceInfo = (await this.deviceService.getDeviceId()).identifier;
    const url = `${environment.baseUrl}assigned-appointment/user?userId=${responseUser?.OnlineDbOid}&IMEI=${deviceInfo}`;

    if (responseUser?.OnlineDbOid) {
      try {
        const res = await this.httpService
          .get<AppointmentResponse>(url, {
            headers: {
              'Content-Type': 'application/json',
              'No-Auth': 'True',
              Authorization: 'Bearer Jl7Fl8Ee64w=',
            },
          })
          .toPromise();

        const { isSuccess, data } = res || {};

        if (isSuccess && data) {
          await this.storageService.insertAppointmentData(data);
          await this.clientStorageService.getClients();
          await this.appointmentStorageService.getAssignedAppointments();

          await this.toastService.openToast({
            message: this.english ? `Appointment synced successfully` : 'Songakhona kubona liphoyinti lakho',
            position: 'bottom',
            duration: 1000,
            color: 'success',
          });
        } else {
          console.log('Error:', res);
        }
      } catch (err) {
        console.log('Error:', err);
      } finally {
      }
    } else {
    }
  }

  // handle syncing all data with one click
  async handleSyncAll() {
    const isConnected = (await this.networkService.getCurrentNetworkStatus()).connected;
    console.log(isConnected);
    // try to sync all data
    if (isConnected) {
      try {
        this.isLookupSyncLoading = true;

        await this.handleSync();
        console.log('First sync completed successfully.');

        await this.handleAppointmentSync();
        console.log('Second sync completed successfully.');

        await this.onSyncClick();
        console.log('Third sync completed successfully.');
      } catch (error) {
      } finally {
        this.isLookupSyncLoading = false;
      }
    } else {
      this.toastService.openToast({
        message: `You are not connected to the Internet for data synchronization.`,
        color: 'danger',
        duration: 1000,
      });
    }
  }

  // * for syncing transactions
  async openModalSync() {
    const network = await this.networkService.getCurrentNetworkStatus();

    // check if device is online
    if (!network.connected) {
      this.toastService.openToast({
        message: `Please connect to the internet`,
        position: 'bottom',
        duration: 1000,
        color: 'danger',
      });
      return;
    }

    // open modal
    const modal = await this.modalService.presentModal({
      component: SyncModalWizardComponent,
      cssClass: 'sync-modal',
    });

    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.toastService.openToast({
        message: this.english ? `Data synced successfully 2` : 'Emafayela sekakhona',
        position: 'bottom',
        duration: 1000,
        color: 'success',
      });
    }
  }
}
