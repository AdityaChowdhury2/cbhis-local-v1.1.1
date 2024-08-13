import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MalariaCaseFindingWizardComponent } from './malaria-case-finding-wizard.component';

describe('MalariaCaseFindingWizardComponent', () => {
  let component: MalariaCaseFindingWizardComponent;
  let fixture: ComponentFixture<MalariaCaseFindingWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MalariaCaseFindingWizardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MalariaCaseFindingWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
