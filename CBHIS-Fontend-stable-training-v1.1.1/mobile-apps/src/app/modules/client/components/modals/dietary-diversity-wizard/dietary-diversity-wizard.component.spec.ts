import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DietaryDiversityWizardComponent } from './dietary-diversity-wizard.component';

describe('DietaryDiversityWizardComponent', () => {
  let component: DietaryDiversityWizardComponent;
  let fixture: ComponentFixture<DietaryDiversityWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DietaryDiversityWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DietaryDiversityWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
