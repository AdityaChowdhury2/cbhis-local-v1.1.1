import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BreastfeedingAndComplimentaryWizardComponent } from './breastfeeding-and-complimentary-wizard.component';

describe('BreastfeedingAndComplimentaryWizardComponent', () => {
  let component: BreastfeedingAndComplimentaryWizardComponent;
  let fixture: ComponentFixture<BreastfeedingAndComplimentaryWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BreastfeedingAndComplimentaryWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BreastfeedingAndComplimentaryWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
