import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfectionControlAssessmentWizardComponent } from './infection-control-assessment-wizard.component';

describe('InfectionControlAssessmentWizardComponent', () => {
  let component: InfectionControlAssessmentWizardComponent;
  let fixture: ComponentFixture<InfectionControlAssessmentWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfectionControlAssessmentWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfectionControlAssessmentWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
