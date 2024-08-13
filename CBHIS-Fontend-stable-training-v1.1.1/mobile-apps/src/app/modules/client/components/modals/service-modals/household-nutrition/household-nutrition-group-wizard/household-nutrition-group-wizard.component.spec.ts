import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HouseholdNutritionGroupWizardComponent } from './household-nutrition-group-wizard.component';

describe('HouseholdNutritionGroupWizardComponent', () => {
  let component: HouseholdNutritionGroupWizardComponent;
  let fixture: ComponentFixture<HouseholdNutritionGroupWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseholdNutritionGroupWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HouseholdNutritionGroupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
