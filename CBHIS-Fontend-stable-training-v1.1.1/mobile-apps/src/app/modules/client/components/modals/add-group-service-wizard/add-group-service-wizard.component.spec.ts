import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddGroupServiceWizardComponent } from './add-group-service-wizard.component';

describe('AddGroupServiceWizardComponent', () => {
  let component: AddGroupServiceWizardComponent;
  let fixture: ComponentFixture<AddGroupServiceWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGroupServiceWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddGroupServiceWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
