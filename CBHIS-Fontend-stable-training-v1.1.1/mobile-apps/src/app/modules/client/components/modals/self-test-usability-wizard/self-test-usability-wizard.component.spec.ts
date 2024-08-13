import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelfTestUsabilityWizardComponent } from './self-test-usability-wizard.component';

describe('SelfTestUsabilityWizardComponent', () => {
  let component: SelfTestUsabilityWizardComponent;
  let fixture: ComponentFixture<SelfTestUsabilityWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfTestUsabilityWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelfTestUsabilityWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
