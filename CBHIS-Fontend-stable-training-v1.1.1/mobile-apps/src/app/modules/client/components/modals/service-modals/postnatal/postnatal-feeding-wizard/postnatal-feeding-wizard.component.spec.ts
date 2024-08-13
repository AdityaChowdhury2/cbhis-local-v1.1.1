import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PostnatalFeedingWizardComponent } from './postnatal-feeding-wizard.component';

describe('PostnatalFeedingWizardComponent', () => {
  let component: PostnatalFeedingWizardComponent;
  let fixture: ComponentFixture<PostnatalFeedingWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostnatalFeedingWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostnatalFeedingWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
