import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChildHealthGroupWizardComponent } from './child-health-group-wizard.component';

describe('ChildHealthGroupWizardComponent', () => {
  let component: ChildHealthGroupWizardComponent;
  let fixture: ComponentFixture<ChildHealthGroupWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildHealthGroupWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChildHealthGroupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
