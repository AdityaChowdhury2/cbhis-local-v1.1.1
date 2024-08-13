import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, forkJoin, from, map, of, switchMap } from 'rxjs';
import { ModalService } from 'src/app/shared/services/modal.service';
import { dateFormatter } from './../../../../shared/utils/dateFormatter';

import { Gender } from 'src/app/shared/enums/gender.enum';

import * as dayjs from 'dayjs';
import { LanguageService } from 'src/app/shared/services/language.service';
import { CreateAppointmentWithHeadWizardComponent } from '../../components/modals/create-appointment-with-head-wizard/create-appointment-with-head-wizard.component';
import { RescheduleWizardComponent } from '../../components/modals/reschedule-wizard/reschedule-wizard.component';
import { Client } from '../../models/client';
import { AppointmentStorageService } from '../../services/appointment-storage.service';
import { ClientStorageService } from '../../services/client-storage.service';
import { CommunicatorService } from '../../services/communicator.service';
import { SearchStorageService } from '../../services/search-storage.service';
import { VillageStorageService } from '../../services/village-storage.service';

interface ClientWithAppointment extends Client {
  appointmentId: string;
  AppointmentType: string;
  AppointmentDate: string;
  Details: string;
  DependentCount: number;
}
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  // * Local Variables
  chipNames = ['HeadMember', 'Location', 'Member', 'Contact'];
  selectedFilter: string = this.chipNames[0];
  // searchResults$: Observable<ClientWithDependentCount[]> = new Observable<ClientWithDependentCount[]>();
  searchResults$: Observable<any> = new Observable<any>();
  isResultShow: boolean = false;
  searchResultObservableId: any;
  searchText: FormControl = new FormControl('', Validators.required);
  searchType: FormControl = new FormControl('', Validators.required);
  dateForm: FormControl = new FormControl();
  date: Date | string = new Date();
  subscriptions: Subscription[] = [];
  isErrorShow: boolean = false;
  private subscription: Subscription = new Subscription();

  combinedResults: any[] = [];
  filterResults: ClientWithAppointment[] = [] as ClientWithAppointment[];
  searchTerm$ = new BehaviorSubject<string>('');
  english = true;

  // * Constructor
  constructor(
    private modalService: ModalService,
    private searchStorageService: SearchStorageService,
    private clientStorageService: ClientStorageService,
    private villageService: VillageStorageService,
    // private modalController: ModalController,
    private appointmentStorage: AppointmentStorageService,
    private communicatorService: CommunicatorService,
    private cd: ChangeDetectorRef,
    public languageService: LanguageService
  ) {}

  // * Init Initial Data
  ngOnInit() {
    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });

    this.clientStorageService.fetchClients().subscribe((clients) => {
      // this.filterAppointmentsByDate(this.dateForm.value);
      console.log('All clients from search component', clients);
    });

    this.dateForm = new FormControl(dateFormatter(new Date().toISOString()));
    this.subscription = this.communicatorService.callFilterAppointmentsByDate.subscribe((date) => {
      this.filterAppointmentsByDate(date);
    });

    this.appointmentStorage.getAssignedAppointments();
    // this.appointmentStorage.loadAssignedAppointments();
    console.log('isResultShow ==>', this.isResultShow);
    // * Initialize search Form

    // this.searchText = new FormControl('', Validators.required);
    // this.searchType = new FormControl(this.selectedFilter, Validators.required);

    this.subscriptions.push(
      this.dateForm.valueChanges.subscribe((newDate) => {
        console.log('newDate', newDate);
        console.log(this.date);
        this.filterAppointmentsByDate(dateFormatter(new Date(this.date).toISOString(), 'y-MM-dd'));
      })
    );

    // const newDate = new Date(this.dateForm.value);
    // console.log('object', dayjs(this.dateForm.value, 'y-dd-MM').toDate());
    // const newDate = dateFormatter(dayjs(this.date).toISOString(), 'y-dd-MM');
    // console.log('new datae', newDate);

    this.filterAppointmentsByDate(dateFormatter(dayjs(this.date).toISOString(), 'y-MM-dd'));

    this.searchResultObservableId = this.searchResults$.subscribe((res) => {
      console.log('searchResultObservableId ', res);
      if (res.length > 0) {
        this.isResultShow = true;
        this.isErrorShow = false;
      } else {
        this.isErrorShow = true;
      }
    });

    this.loadCombinedData();
    this.setupSearch();
  }

  filterAppointmentsByDate(formattedDate: string) {
    console.log('Filter Appointments By Date', formattedDate);
    this.searchResults$ = from(this.appointmentStorage.filterAppointmentsByDate(formattedDate)).pipe(
      switchMap((appointments) => {
        console.log('New Appointments', appointments);
        return forkJoin(
          appointments.map((appointment) =>
            from(this.clientStorageService.fetchMemberByOid(appointment.ClientId)).pipe(
              map((client) => ({
                ...client,
                appointmentId: appointment.TransactionId,
                AppointmentType: appointment.AppointmentType,
                AppointmentDate: dateFormatter(appointment.AppointmentDate, 'dd-MM-yyyy'),
                Details: appointment.Details,
              })),
              switchMap((client) => {
                if (client?.Oid) {
                  console.log('object', client);
                  return from(this.clientStorageService.findMembersCountByFamilyHeadId(client.Oid)).pipe(
                    map((dependentCount) => ({
                      ...client,
                      DependentCount: dependentCount,
                    }))
                  );
                } else {
                  console.log('nothing found');
                  return of({});
                }
              })
            )
          )
        );
      })
    );

    this.subscriptions.push(
      this.searchResults$.subscribe((res) => {
        console.log('res ', res);
        if (res.length > 0) {
          this.isResultShow = true;
          this.isErrorShow = false;
        } else {
          this.isErrorShow = true;
        }
      })
    );
  }

  // Open Reschedule Wizard
  openRescheduleWizard(appointment: any) {
    console.log('appointment from search', appointment);

    this.modalService.presentModal({
      component: RescheduleWizardComponent,
      cssClass: 'reschedule-wizard',
      id: 'reschedule-wizard',
      componentProps: {
        appointmentId: appointment?.appointmentId,

        // ...(appointment || {}),
      },
    });
  }

  // * Generate Gender Group
  getGenderName(value: number): string {
    switch (value) {
      case Gender.Male:
        return 'Male';
      case Gender.Female:
        return 'Female';
      case Gender.Unknown:
        return 'Unknown';
      default:
        return 'Unknown';
    }
  }

  async getDependentCount(familyHeadId: string) {
    console.log(familyHeadId);
    return await this.clientStorageService.findMembersCountByFamilyHeadId(familyHeadId);
  }

  async openModal() {
    const modal = await this.modalService.presentModal({
      component: CreateAppointmentWithHeadWizardComponent,
      cssClass: 'add-client-wizard',
      id: 'create-appointment-with-head-wizard',
    });

    const { data } = await modal.onDidDismiss();
    console.log(data);
    if (data?.success) {
      await this.loadCombinedData();
    }
  }

  // load combined data
  async loadCombinedData() {
    this.appointmentStorage
      .fetchAssignedAppointments()
      .pipe(
        switchMap((appointments) =>
          forkJoin(
            appointments.map((appointment) =>
              from(this.clientStorageService.fetchMemberByOid(appointment.ClientId)).pipe(
                map((client) => ({
                  ...client,
                  appointmentId: appointment.TransactionId,
                  AppointmentType: appointment.AppointmentType,
                  AppointmentDate: dateFormatter(appointment.AppointmentDate, 'dd-MM-yyyy'),
                  Details: appointment.Details,
                })),
                switchMap((client) => {
                  if (client?.Oid) {
                    console.log('object', client);
                    return from(this.clientStorageService.findMembersCountByFamilyHeadId(client.Oid)).pipe(
                      map((dependentCount) => ({
                        ...client,
                        DependentCount: dependentCount,
                      }))
                    );
                  } else {
                    console.log('nothing found');
                    return of({});
                  }
                })
              )
            )
          )
        )
      )
      .subscribe((res) => {
        console.log('Combined result from search => ', res);
        console.log('res ', res);
        if (res?.length > 0) {
          this.isResultShow = true;
          this.isErrorShow = false;
          this.combinedResults = res;
          this.filterResults = res as ClientWithAppointment[];
        } else {
          this.isErrorShow = true;
        }
      });
  }

  setupSearch() {
    this.searchTerm$
      .pipe(
        map((searchTerm) =>
          this.combinedResults.filter(
            (item) =>
              item.FirstName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
              item.LastName?.toLowerCase()?.includes(searchTerm.toLowerCase())
          )
        )
      )
      .subscribe((filtered) => {
        console.log('filtered results => ', filtered);
        this.filterResults = filtered;
        // this.combinedResults = filtered;
      });
  }

  onSearchTermChange(event: any) {
    this.searchTerm$.next(event.target.value);
  }

  // * date change handler
  changeDate(event: CustomEvent) {
    // this.searchForm.controls['date'].setValue(this.formatDate(event.detail.value));

    console.log(event.detail.value);
    this.date = event.detail.value;
    this.dateForm.setValue(dateFormatter(event.detail.value));
    // this.appointmentStorage.getAssignedAppointments();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
