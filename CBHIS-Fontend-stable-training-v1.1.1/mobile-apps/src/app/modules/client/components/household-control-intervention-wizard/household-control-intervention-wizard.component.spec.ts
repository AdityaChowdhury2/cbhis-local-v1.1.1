import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HouseholdControlInterventionWizardComponent } from './household-control-intervention-wizard.component';

describe('HouseholdControlInterventionWizardComponent', () => {
  let component: HouseholdControlInterventionWizardComponent;
  let fixture: ComponentFixture<HouseholdControlInterventionWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseholdControlInterventionWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HouseholdControlInterventionWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
