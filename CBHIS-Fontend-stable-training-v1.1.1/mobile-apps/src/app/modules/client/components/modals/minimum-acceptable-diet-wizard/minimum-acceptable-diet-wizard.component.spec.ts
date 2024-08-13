import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MinimumAcceptableDietWizardComponent } from './minimum-acceptable-diet-wizard.component';

describe('MinimumAcceptableDietWizardComponent', () => {
  let component: MinimumAcceptableDietWizardComponent;
  let fixture: ComponentFixture<MinimumAcceptableDietWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MinimumAcceptableDietWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MinimumAcceptableDietWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
