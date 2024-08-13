import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateAppointmentWithHeadWizardComponent } from './create-appointment-with-head-wizard.component';

describe('CreateAppointmentWithHeadWizardComponent', () => {
  let component: CreateAppointmentWithHeadWizardComponent;
  let fixture: ComponentFixture<CreateAppointmentWithHeadWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAppointmentWithHeadWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAppointmentWithHeadWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
