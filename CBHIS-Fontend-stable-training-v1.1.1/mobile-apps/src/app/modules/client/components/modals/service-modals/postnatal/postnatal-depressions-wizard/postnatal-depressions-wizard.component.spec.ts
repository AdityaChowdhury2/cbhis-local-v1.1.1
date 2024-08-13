import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PostnatalDepressionsWizardComponent } from './postnatal-depressions-wizard.component';

describe('PostnatalDepressionsWizardComponent', () => {
  let component: PostnatalDepressionsWizardComponent;
  let fixture: ComponentFixture<PostnatalDepressionsWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostnatalDepressionsWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostnatalDepressionsWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
