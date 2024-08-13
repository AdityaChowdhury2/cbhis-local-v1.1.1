import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FamilyPlanningServiceWizardComponent } from './family-planning-service-wizard.component';

describe('FamilyPlanningServiceWizardComponent', () => {
  let component: FamilyPlanningServiceWizardComponent;
  let fixture: ComponentFixture<FamilyPlanningServiceWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyPlanningServiceWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyPlanningServiceWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
