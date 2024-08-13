import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AncCounselingForPregnancyWizardComponent } from './anc-counseling-for-pregnancy-wizard.component';

describe('AncCounselingForPregnancyWizardComponent', () => {
  let component: AncCounselingForPregnancyWizardComponent;
  let fixture: ComponentFixture<AncCounselingForPregnancyWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AncCounselingForPregnancyWizardComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AncCounselingForPregnancyWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
