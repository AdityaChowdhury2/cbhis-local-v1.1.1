import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MalariaSymptomsWizardComponent } from './malaria-symptoms-wizard.component';

describe('MalariaSymptomsWizardComponent', () => {
  let component: MalariaSymptomsWizardComponent;
  let fixture: ComponentFixture<MalariaSymptomsWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MalariaSymptomsWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MalariaSymptomsWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
