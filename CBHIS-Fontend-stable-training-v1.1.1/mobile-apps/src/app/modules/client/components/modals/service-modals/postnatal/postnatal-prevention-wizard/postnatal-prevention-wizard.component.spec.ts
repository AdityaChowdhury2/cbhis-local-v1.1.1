import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PostnatalPreventionWizardComponent } from './postnatal-prevention-wizard.component';

describe('PostnatalPreventionWizardComponent', () => {
  let component: PostnatalPreventionWizardComponent;
  let fixture: ComponentFixture<PostnatalPreventionWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostnatalPreventionWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostnatalPreventionWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
