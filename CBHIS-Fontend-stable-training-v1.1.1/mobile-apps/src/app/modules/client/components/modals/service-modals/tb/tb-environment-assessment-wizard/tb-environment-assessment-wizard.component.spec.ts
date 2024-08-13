import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TbEnvironmentAssessmentWizardComponent } from './tb-environment-assessment-wizard.component';

describe('TbEnvironmentAssessmentWizardComponent', () => {
  let component: TbEnvironmentAssessmentWizardComponent;
  let fixture: ComponentFixture<TbEnvironmentAssessmentWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TbEnvironmentAssessmentWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TbEnvironmentAssessmentWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
