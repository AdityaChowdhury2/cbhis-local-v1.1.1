import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NCDScreeningWizardComponent } from './ncd-screening-wizard.component';

describe('NCDScreeningWizardComponent', () => {
  let component: NCDScreeningWizardComponent;
  let fixture: ComponentFixture<NCDScreeningWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NCDScreeningWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NCDScreeningWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
