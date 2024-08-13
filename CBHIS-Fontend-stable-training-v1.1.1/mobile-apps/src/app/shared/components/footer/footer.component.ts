import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @Output() saveEvent = new EventEmitter<void>();
  @Input() off!: boolean;
  english = true;

  constructor(private modalService: ModalService, public languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.languageObservable$.subscribe((data) => {
      this.english = data;
    });
  }

  onSubmit() {
    this.saveEvent.emit();
  }

  closeWizard() {
    this.modalService.dismissModal();
  }
}
