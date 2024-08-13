import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AncDiscussedTopicsWizardComponent } from './anc-discussed-topics-wizard.component';

describe('AncDiscussedTopicsWizardComponent', () => {
  let component: AncDiscussedTopicsWizardComponent;
  let fixture: ComponentFixture<AncDiscussedTopicsWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AncDiscussedTopicsWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AncDiscussedTopicsWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
