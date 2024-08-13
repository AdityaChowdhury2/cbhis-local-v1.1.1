import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TBDiscussedTopicWizardComponent } from './tb-discussed-topic-wizard.component';

describe('TBDiscussedTopicWizardComponent', () => {
  let component: TBDiscussedTopicWizardComponent;
  let fixture: ComponentFixture<TBDiscussedTopicWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TBDiscussedTopicWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TBDiscussedTopicWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
