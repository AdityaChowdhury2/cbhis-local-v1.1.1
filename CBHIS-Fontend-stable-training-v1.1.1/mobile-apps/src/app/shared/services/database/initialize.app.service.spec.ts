import { AlertController, ToastController } from '@ionic/angular';
import { ToastService } from '../toast.service';
import { DbStorageService } from './db-storage.service';
import { DbnameVersionService } from './dbname-version.service';
import { InitializeAppService } from './initialize.app.service';
import { SQLiteService } from './sqlite.service';

describe('InitializeAppService', () => {
  it('should create an instance', () => {
    const service = new InitializeAppService(
      new SQLiteService(),
      new DbStorageService(
        new SQLiteService(),
        new DbnameVersionService(),
        new ToastService(new ToastController(), new AlertController())
      )
    );
    expect(service).toBeTruthy();
  });
});
