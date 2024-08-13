import { Component, Input, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { LanguageService } from 'src/app/shared/services/language.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { AppointmentStorageService } from '../../../services/appointment-storage.service';

@Component({
  selector: 'app-reschedule-wizard',
  templateUrl: './reschedule-wizard.component.html',
  styleUrls: ['./reschedule-wizard.component.scss'],
})
export class RescheduleWizardComponent implements OnInit {
  @Input() appointmentId!: string;
  date: Date = new Date();
  english = true;

  constructor(
    private modalService: ModalService,
    private appointmentService: AppointmentStorageService,
    public languageService: LanguageService
  ) {
    console.log('appointmentId from reschedule wizard', this.appointmentId);
  }

  ngOnInit() {
    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });
  }

  // For submitting the form
  async onSubmit() {
    // TODO: Implement onSubmit method
    // On successful submission, dismiss the modal
    console.log('appointmentId from reschedule wizard', this.appointmentId);
    const date = new Date(dayjs(this.date).format('YYYY-MM-DD')).toISOString();
    await this.appointmentService.rescheduleAppointment(this.appointmentId, date);
    this.dismissModal();
  }

  onDateChange(event: CustomEvent) {
    this.date = event.detail.value;
    console.log('date time', event.detail.value);
  }

  // For Dismissing the modal
  dismissModal() {
    this.modalService.dismissModal();
  }
}
