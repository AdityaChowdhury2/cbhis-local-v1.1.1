import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NCDHistoryWizardComponent } from './ncd-history-wizard.component';

describe('NCDHistoryWizardComponent', () => {
  let component: NCDHistoryWizardComponent;
  let fixture: ComponentFixture<NCDHistoryWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NCDHistoryWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NCDHistoryWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
