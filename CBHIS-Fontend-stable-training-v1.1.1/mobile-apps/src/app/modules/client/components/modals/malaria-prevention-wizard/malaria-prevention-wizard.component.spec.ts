import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MalariaPreventionWizardComponent } from './malaria-prevention-wizard.component';

describe('MalariaPreventionWizardComponent', () => {
  let component: MalariaPreventionWizardComponent;
  let fixture: ComponentFixture<MalariaPreventionWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MalariaPreventionWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MalariaPreventionWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
