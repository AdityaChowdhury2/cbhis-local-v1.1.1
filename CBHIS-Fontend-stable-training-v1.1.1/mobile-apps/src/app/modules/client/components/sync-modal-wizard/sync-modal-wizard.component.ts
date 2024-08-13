import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserStorageService } from 'src/app/modules/auth/services/user-storage.service';
import { TableCode } from 'src/app/shared/enums/table-code.enum';
import { resObj } from 'src/app/shared/models/api-res';
import { AppointmentResponse } from 'src/app/shared/models/appointment';
import { Root } from 'src/app/shared/models/online-format';
import { SyncApiResponse } from 'src/app/shared/models/upload-state';
import { DbStorageService } from 'src/app/shared/services/database/db-storage.service';
import { DeviceService } from 'src/app/shared/services/device.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { SyncStorageService } from 'src/app/shared/services/sync-storage.service';
import { ThemeService } from 'src/app/shared/services/theme.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { isEnglish } from 'src/app/shared/utils/common';
import { environment } from 'src/environments/environment';
import { ClientStorageService } from 'src/reserved-services/client-storage-service';
import { AppointmentStorageService } from '../../services/appointment-storage.service';
import { VillageStorageService } from '../../services/village-storage.service';

@Component({
  selector: 'app-sync-modal-wizard',
  templateUrl: './sync-modal-wizard.component.html',
  styleUrls: ['./sync-modal-wizard.component.scss'],
})
export class SyncModalWizardComponent implements OnInit {
  isLookupSyncLoading: boolean = false;
  isLookupSynced: boolean = false;
  isAppointmentLoading: boolean = false;
  isUploading: boolean = false;
  currentTheme: string = 'light';
  themeSubscription: Subscription = new Subscription();
  english = isEnglish;

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
    private theme: ThemeService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });
  }

  // * for syncing transactions
  // async onSyncClick() {
  //   console.log('Sync clicked');
  //   this.syncStorageService.getAllTransactionsFromQueue().then((res) => {
  //     console.log('SyncQueue:', res);
  //     const filterUserAccountTable = res.filter((data) => data.tableCode !== 45);
  //     if (res.length > 0) {
  //       this.isLookupSyncLoading = true;
  //       this.httpService
  //         .post(`${environment.baseUrl}update-state`, filterUserAccountTable, {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'No-Auth': 'True',
  //             Authorization: 'Bearer Jl7Fl8Ee64w=',
  //           },
  //         })
  //         .subscribe(async (response: any) => {
  //           console.log('Response:', response);
  //           // this.syncStorageService.clearTransactionsQueue();
  //           if (response?.isSuccess) {
  //             console.log('Sync response data ===>', response.data);

  //             if (response.data.length > 0) {
  //               response.data.forEach((element: any) => {
  //                 console.log(element);
  //                 if (element.tableCode === TableCode['ANC']) {
  //                   this.storageService.updateANCItem(element.transactionId as string, element.anc);
  //                   if (element.ANC?.TransactionId)
  //                     this.syncStorageService.deleteQueueByTableAndTransactionId(
  //                       TableCode.ANC.toString(),
  //                       element?.ANC?.TransactionId
  //                     );
  //                 }
  //                 if (element.tableCode === TableCode.FamilyPlan) {
  //                   this.storageService.updateFamilyPlanItem(element.FamilyPlans);
  //                   if (element.FamilyPlans?.TransactionId)
  //                     this.syncStorageService.deleteQueueByTableAndTransactionId(
  //                       TableCode.FamilyPlan.toString(),
  //                       element?.FamilyPlans?.TransactionId
  //                     );
  //                 }
  //               });
  //             }
  //             this.isLookupSyncLoading = false;
  //             this.toastService.openToast({
  //               message: `Data synced successfully`,
  //               position: 'bottom',
  //               duration: 1000,
  //               color: 'success',
  //             });
  //             console.log('Data synced successfully', await this.syncStorageService.getAllTransactionsFromQueue_Old());
  //             const sql = `SELECT * FROM ANC;`;
  //             const execute = await this.storageService.db.query(sql);

  //             console.log('Anc topic', execute);
  //           } else {
  //             this.toastService.openToast({
  //               message: `Data synchronization failed`,
  //               position: 'bottom',
  //               duration: 1000,
  //               color: 'danger',
  //             });
  //           }
  //         });
  //     } else {
  //       this.toastService.openToast({
  //         message: `No data to sync`,
  //         position: 'bottom',
  //         duration: 1000,
  //         color: 'danger',
  //       });
  //     }
  //   });
  // }

  // * for syncing transactions
  // async onSyncClick() {
  //   console.log('Sync clicked');
  //   this.syncStorageService.getAllTransactionsFromQueue().then((res) => {
  //     console.log('SyncQueue:', res);
  //     const filterUserAccountTable = res.filter((data) => data.tableCode !== 45);
  //     if (res.length > 0) {
  //       this.isLookupSyncLoading = true;
  //       this.httpService
  //         .post(`${environment.baseUrl}update-state`, filterUserAccountTable, {
  //           headers: {
  //             'Content-Type': 'application/json',
  //             'No-Auth': 'True',
  //             Authorization: 'Bearer Jl7Fl8Ee64w=',
  //           },
  //         })
  //         .subscribe(async (response: any) => {
  //           console.log('Response:', response);
  //           // this.syncStorageService.clearTransactionsQueue();
  //           if (response?.isSuccess) {
  //             console.log('Sync response data ===>', response.data);

  //             if (response.data.length > 0) {
  //               response.data.forEach((element: any) => {
  //                 console.log(element);
  //                 if (element.tableCode === TableCode['ANC']) {
  //                   this.storageService.updateANCItem(element.transactionId as string, element.anc);
  //                   if (element?.anc?.transactionId)
  //                     this.syncStorageService.deleteQueueByTableAndTransactionId('ANC', element?.anc?.transactionId);
  //                 }
  //                 if (element.tableCode === TableCode['FamilyPlan']) {
  //                   this.storageService.updateFamilyPlanItem(element.transactionId, element.familyPlan);
  //                   if (element.familyPlans?.transactionId)
  //                     this.syncStorageService.deleteQueueByTableAndTransactionId(
  //                       'FamilyPlan',
  //                       element.familyPlans?.transactionId
  //                     );
  //                 }
  //               });
  //             }
  //             this.isLookupSyncLoading = false;
  //             this.toastService.openToast({
  //               message: `Data synced successfully`,
  //               position: 'bottom',
  //               duration: 1000,
  //               color: 'success',
  //             });
  //             console.log('Data synced successfully', await this.syncStorageService.getAllTransactionsFromQueue_Old());
  //             const sql = `SELECT * FROM ANC;`;
  //             const execute = await this.storageService.db.query(sql);
  //             console.log('Anc topic', execute);
  //             const sqle = `SELECT * FROM FamilyPlan`;
  //             const w = await this.storageService.db.query(sqle);

  //             console.log('family plan', w);
  //           } else {
  //             this.toastService.openToast({
  //               message: `Data synchronization failed`,
  //               position: 'bottom',
  //               duration: 1000,
  //               color: 'danger',
  //             });
  //           }
  //         });
  //     } else {
  //       this.toastService.openToast({
  //         message: `No data to sync`,
  //         position: 'bottom',
  //         duration: 1000,
  //         color: 'danger',
  //       });
  //     }
  //   });
  // }

  async _onSyncClick() {
    console.log('Sync clicked');
    const res = await this.syncStorageService.getAllTransactionsFromQueue();
    console.log('SyncQueue:', res);
    const filterUserAccountTable = res.filter((data) => data.tableCode !== 45);
    this.isLookupSyncLoading = false;
  }

  async onSyncClick() {
    console.log('Sync clicked');
    const res = await this.syncStorageService.getAllTransactionsFromQueue();
    console.log('SyncQueue:', res);
    const filterUserAccountTable = res.filter((data) => data.tableCode !== 45);
    if (res.length > 0) {
      try {
        this.isLookupSyncLoading = true;
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
        //  this.syncStorageService.clearTransactionsQueue();
        if (response?.isSuccess) {
          console.log('Sync response data ===>', response.data);

          if (response?.data.length > 0) {
            for (const element of response.data) {
              console.log(element);
              if (element.tableCode === TableCode['ANC']) {
                await this.storageService.updateANCItem(element.transactionId as string, element.anc);
                if (element?.anc?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId('ANC', element?.anc?.transactionId);
                }
              }
              if (element.tableCode === TableCode['FamilyPlan']) {
                await this.storageService.updateFamilyPlanItem(element.transactionId, element.familyPlans);
                if (element.familyPlans?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'FamilyPlan',
                    element.familyPlans?.transactionId
                  );
                }
              }
              if (element.tableCode === TableCode['ChildGrowthMonitoring']) {
                console.log('In ChildGrowthMonitoring', element.transactionId, element.childGrowthMonitorings);
                await this.storageService.updateChildGrowthMonitoringItem(
                  element.transactionId,
                  element.childGrowthMonitorings
                );
                if (element.childGrowthMonitorings?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ChildGrowthMonitoring',
                    element.childGrowthMonitorings?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['ClientMinimumAcceptableDiet']) {
                await this.storageService.updateClientMinimumAcceptableDietItem(
                  element.transactionId,
                  element.clientMinimumAcceptableDiets
                );
                if (element.clientMinimumAcceptableDiets?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ClientMinimumAcceptableDiet',
                    element.clientMinimumAcceptableDiets?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['Counseling']) {
                await this.storageService.updateCounselingItem(element.transactionId, element.counselings);
                if (element.counselings?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'Counseling',
                    element.counselings?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HIVSelfTest']) {
                await this.storageService.updateHIVSelfTestItem(element.transactionId, element.hivSelfTests);
                if (element.hivSelfTests?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HIVSelfTest',
                    element.hivSelfTests?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['ARTClient']) {
                await this.storageService.updateARTClientItem(element.transactionId, element.artClients);
                if (element.artClients?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ARTClient',
                    element.artClients?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['ClientTBSymptom']) {
                await this.storageService.updateClientTBSymptomItem(element.transactionId, element.clientTBSymptoms);
                if (element.clientTBSymptoms?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ClientTBSymptom',
                    element.clientTBSymptoms?.transactionId
                  );
                }
              }
              if (element.tableCode === TableCode['ClientTBEnvironmentalAssessment']) {
                await this.storageService.updateClientTBEnvironmentalAssessmentItem(
                  element.transactionId,
                  element.clientTBEnvironmentalAssessments
                );
                if (element.clientTBEnvironmentalAssessments?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ClientTBEnvironmentalAssessment',
                    element.clientTBEnvironmentalAssessments?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['MalariaCaseFinding']) {
                await this.storageService.updateMalariaCaseFindingItem(
                  element.transactionId,
                  element.malariaCaseFinding
                );
                if (element.malariaCaseFinding?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'MalariaCaseFinding',
                    element.malariaCaseFinding?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['MalariaPrevention']) {
                await this.storageService.updateMalariaPreventionItem(element.transactionId, element.malariaPrevention);
                if (element.malariaPrevention?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'MalariaPrevention',
                    element.malariaPrevention?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HouseholdControlIntervention']) {
                await this.storageService.updateHouseholdControlInterventionItem(
                  element.transactionId,
                  element.householdControlIntervention
                );
                if (element.householdControlIntervention?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HouseholdControlIntervention',
                    element.householdControlIntervention?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HBCClientAssessment']) {
                await this.storageService.updateHBCClientAssessmentItem(
                  element.transactionId,
                  element.hbcClientAssessment
                );
                if (element.hbcClientAssessment?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HBCClientAssessment',
                    element.hbcClientAssessment?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['ClientNCDHistory']) {
                await this.storageService.updateClientNCDHistoryItem(element.transactionId, element.clientNCDHistorie);
                if (element.clientNCDHistorie?.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ClientNCDHistory',
                    element.clientNCDHistorie?.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['Client']) {
                if (element.clients?.oid) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId('Client', element.clients?.oid);
                }
              }

              // * For Multi Select Services

              if (element.tableCode === TableCode['DiscussedANCTopic']) {
                if (element.discussedANCTopics.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'DiscussedANCTopic',
                    element.discussedANCTopics.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['DiscussedTopic']) {
                if (element.discussedTopics.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'DiscussedTopic',
                    element.discussedTopics.transactionId
                  );
                }
              }
              if (element.tableCode === TableCode['DiscussedTopic']) {
                if (element.discussedTopics.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'DiscussedTopic',
                    element.discussedTopics.transactionId
                  );
                }
              }
              if (element.tableCode === TableCode['UsedFamilyPlanMethod']) {
                if (element.usedFamilyPlanMethods.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'UsedFamilyPlanMethod',
                    element.usedFamilyPlanMethods.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HouseholdDietaryDiversity']) {
                if (element.householdDietaryDiversities.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HouseholdDietaryDiversity',
                    element.householdDietaryDiversities.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['ClientBCF']) {
                if (element.clientBCFs.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ClientBCF',
                    element.clientBCFs.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['TBDiscussedTopic']) {
                if (element.tbDiscussedTopics.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'TBDiscussedTopic',
                    element.tbDiscussedTopics.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['TBKeyAffectedClient']) {
                if (element.tbKeyAffectedClients.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'TBKeyAffectedClient',
                    element.tbKeyAffectedClients.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HouseholdMalariaRisk']) {
                if (element.householdMalariaRisk.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HouseholdMalariaRisk',
                    element.householdMalariaRisk.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['ClientMalariaSymptom']) {
                if (element.clientMalariaSymptom.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'ClientMalariaSymptom',
                    element.clientMalariaSymptom.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['GivenHBCService']) {
                if (element.givenHBCService.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'GivenHBCService',
                    element.givenHBCService.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HouseholdDrinkingWater']) {
                if (element.householdDrinkingWaters.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HouseholdDrinkingWater',
                    element.householdDrinkingWaters.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HouseholdSafeWaterSource']) {
                if (element.householdSafeWaterSources.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HouseholdSafeWaterSource',
                    element.householdSafeWaterSources.transactionId
                  );
                }
              }

              if (element.tableCode === TableCode['HouseholdWASH']) {
                if (element.householdWASHs.transactionId) {
                  await this.syncStorageService.deleteQueueByTableAndTransactionId(
                    'HouseholdWASH',
                    element.householdWASHs.transactionId
                  );
                }
              }

              // if (element.tableCode === TableCode['HouseholdSafeWaterSources']) {
              //   await this.storageService.updateHouseholdSafeWaterSourceItem(
              //     element.transactionId,
              //     element.householdSafeWaterSources
              //   );
              //   if (element.householdSafeWaterSources?.transactionId) {
              //     await this.syncStorageService.deleteQueueByTableAndTransactionId(
              //       'HouseholdSafeWaterSources',
              //       element.householdSafeWaterSources?.transactionId
              //     );
              //   }
              // }
            }
          }
          this.isLookupSyncLoading = false;
          this.toastService.openToast({
            message: this.english ? `Data synced successfully` : 'Emafayela sekakhona',
            position: 'bottom',
            duration: 1000,
            color: 'success',
          });
          console.log('Data synced successfully', await this.syncStorageService.getAllTransactionsFromQueue_Old());
          const sql = `SELECT * FROM ANC;`;
          const execute = await this.storageService.db.query(sql);
          console.log('Anc topic', execute);
          const sqle = `SELECT * FROM FamilyPlan`;
          const w = await this.storageService.db.query(sqle);

          console.log('family plan', w);
        } else {
          this.isLookupSyncLoading = false;
          this.toastService.openToast({
            message: 'Data synchronization failed',
            position: 'bottom',
            duration: 1000,
            color: 'danger',
          });
        }
      } catch (error) {
      } finally {
        this.isLookupSyncLoading = false;
      }
    } else {
      this.isLookupSyncLoading = false;
      this.toastService.openToast({
        message: `No data to sync`,
        position: 'bottom',
        duration: 1000,
        color: 'danger',
      });
    }
    this.isLookupSyncLoading = false;
  }

  // * handle download sync button
  async handleSync() {
    console.log('IN SYNC CLICK');
    this.isLookupSyncLoading = true;
    // const deviceInfo = (await this.deviceService.getDeviceId()).identifier;
    // const deviceInfo = 'de708e4b-9982-443f-a2f3-712d5987f3b8';
    const deviceInfo = 'cae9b5ba723cd31f';
    console.log('calling handle sync button');
    this.httpService
      .get<Root>(`${environment.baseUrl}download-states?deviceId=${deviceInfo}`, {
        headers: {
          'Content-Type': 'application/json',
          'No-Auth': 'True',
          Authorization: 'Bearer Jl7Fl8Ee64w=',
        },
      })
      .subscribe(
        async (res) => {
          const { isSuccess, data } = res || {};
          if (isSuccess) {
            this.storageService
              .clearLookupTables()
              .then(async () => {
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
                await this.storageService.syncBreastfeedingAndComplementaryFeeding(
                  data.breastfeedingAndComplimentaryFeedings
                );

                // show success message
                this.toastService.openToast({
                  message: this.english ? `Data synced successfully` : 'Emafayela sekakhona',
                  position: 'bottom',
                  duration: 1000,
                  color: 'success',
                });
                this.isLookupSynced = true;
              })
              .catch((error) => {
                console.log(' error in sync', error);
              })
              .finally(() => {
                this.isLookupSyncLoading = false;
              });
          } else {
            console.log('Error:', res);
            this.isLookupSyncLoading = false;
          }
        },
        (error) => {
          console.log('Error:', error);
          this.isLookupSyncLoading = false;
        }
      );
  }
  // * this function is for local test
  async _handleSync() {
    console.log('IN SYNC CLICK');
    this.isLookupSyncLoading = true;
    const deviceInfo = (await this.deviceService.getDeviceId()).identifier;
    // const deviceInfo = 'de708e4b-9982-443f-a2f3-712d5987f3b8';
    // const deviceInfo = 'a5f4572c5026632c';
    console.log('calling handle sync button');

    const res = resObj;

    console.log('Response:', res);

    // return;

    const { isSuccess, data } = res || {};
    if (isSuccess) {
      this.storageService
        .clearLookupTables()
        .then(async () => {
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
          await this.storageService.syncBreastfeedingAndComplementaryFeeding(
            data.breastfeedingAndComplimentaryFeedings
          );

          // show success message
          this.toastService.openToast({
            message: this.english ? `Data synced successfully` : 'Emafayela sekakhona',
            position: 'bottom',
            duration: 1000,
            color: 'success',
          });
          this.isLookupSynced = true;
        })
        .catch((error) => {
          console.log(' error in sync', error);
        })
        .finally(() => {
          this.isLookupSyncLoading = false;
        });
    } else {
      console.log('Error:', res);
      this.isLookupSyncLoading = false;
    }
  }
  // * handle appointment sync
  async handleAppointmentSync() {
    // if (this.isLookupSynced) {
    this.isAppointmentLoading = true;

    const responseUser = await this.userStorageService.findLastCreatedUser();
    const deviceInfo = (await this.deviceService.getDeviceId()).identifier;
    // console.log(deviceInfo);
    console.log(responseUser);
    // const url = `${environment.baseUrl}assigned-appointment/user?userId=74946dd1-4b51-4a44-80b6-08dca4ce56a4&IMEI=de708e4b-9982-443f-a2f3-712d5987f3b8`;
    const url = `${environment.baseUrl}assigned-appointment/user?userId=${responseUser?.OnlineDbOid}&IMEI=${deviceInfo}`;
    console.log('calling handle appointment sync button');
    if (responseUser?.OnlineDbOid) {
      this.httpService
        .get<AppointmentResponse>(url, {
          headers: {
            'Content-Type': 'application/json',
            'No-Auth': 'True',
            Authorization: 'Bearer Jl7Fl8Ee64w=',
          },
        })
        .subscribe(
          async (res) => {
            console.log(res);
            if (res.isSuccess) {
              const { data } = res;
              console.log('Appointment Data:', data);
              await this.storageService.insertAppointmentData(data);
              await this.clientStorageService.getClients();
              await this.appointmentStorageService.getAssignedAppointments();

              this.toastService.openToast({
                message: this.english ? `Appointment synced successfully` : 'Songakhona kubona liphoyinti lakho',
                position: 'bottom',
                duration: 1000,
                color: 'success',
              });
              this.isAppointmentLoading = false;
            } else {
              this.isAppointmentLoading = false;
              console.log('object 0');
            }
          },
          (err) => {
            this.isAppointmentLoading = false;
            console.log(err);
          }
        );
    } else {
      this.isAppointmentLoading = false;
    }
    // } else {
    //   this.toastService.openToast({
    //     message: `Please sync lookup data first`,
    //     position: 'bottom',
    //     duration: 1000,
    //     color: 'danger',
    //   });
    // }
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }
}
