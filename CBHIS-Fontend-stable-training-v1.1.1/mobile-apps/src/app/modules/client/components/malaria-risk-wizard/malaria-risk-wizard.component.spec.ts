import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MalariaRiskWizardComponent } from './malaria-risk-wizard.component';

describe('MalariaRiskWizardComponent', () => {
  let component: MalariaRiskWizardComponent;
  let fixture: ComponentFixture<MalariaRiskWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MalariaRiskWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MalariaRiskWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
