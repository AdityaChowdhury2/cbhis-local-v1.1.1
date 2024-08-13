import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChildGrowthMonitoringWizardComponent } from './child-growth-monitoring-wizard.component';

describe('ChildGrowthMonitoringWizardComponent', () => {
  let component: ChildGrowthMonitoringWizardComponent;
  let fixture: ComponentFixture<ChildGrowthMonitoringWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildGrowthMonitoringWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChildGrowthMonitoringWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
