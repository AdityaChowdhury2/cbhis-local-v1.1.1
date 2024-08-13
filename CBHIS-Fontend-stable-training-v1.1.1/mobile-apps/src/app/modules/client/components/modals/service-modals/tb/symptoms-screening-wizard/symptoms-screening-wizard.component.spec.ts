import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SymptomsScreeningWizardComponent } from './symptoms-screening-wizard.component';

describe('SymptomsScreeningWizardComponent', () => {
  let component: SymptomsScreeningWizardComponent;
  let fixture: ComponentFixture<SymptomsScreeningWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SymptomsScreeningWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SymptomsScreeningWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
