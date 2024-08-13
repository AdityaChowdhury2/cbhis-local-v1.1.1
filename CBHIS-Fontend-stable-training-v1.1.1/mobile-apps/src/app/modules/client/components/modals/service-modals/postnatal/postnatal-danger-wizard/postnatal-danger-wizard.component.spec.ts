import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PostnatalDangerWizardComponent } from './postnatal-danger-wizard.component';

describe('PostnatalDangerWizardComponent', () => {
  let component: PostnatalDangerWizardComponent;
  let fixture: ComponentFixture<PostnatalDangerWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostnatalDangerWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostnatalDangerWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
