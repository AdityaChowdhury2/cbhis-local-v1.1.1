import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HBCClientAssessmentWizardComponent } from './hbc-client-assessment-wizard.component';

describe('HBCClientAssessmentWizardComponent', () => {
  let component: HBCClientAssessmentWizardComponent;
  let fixture: ComponentFixture<HBCClientAssessmentWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HBCClientAssessmentWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HBCClientAssessmentWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
