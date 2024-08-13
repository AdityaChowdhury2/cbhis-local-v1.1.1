import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MalariaGroupWizardComponent } from './malaria-group-wizard.component';

describe('MalariaGroupWizardComponent', () => {
  let component: MalariaGroupWizardComponent;
  let fixture: ComponentFixture<MalariaGroupWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MalariaGroupWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MalariaGroupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
