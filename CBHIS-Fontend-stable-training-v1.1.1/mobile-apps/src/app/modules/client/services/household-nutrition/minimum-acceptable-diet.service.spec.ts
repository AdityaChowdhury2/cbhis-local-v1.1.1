import { TestBed } from '@angular/core/testing';

import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { ClientMinimumAcceptableDiet, MinimumAcceptableDiet } from '../../models/service-models/household-nutrition';
import { MinimumAcceptableDietStorageService } from './minimum-acceptable-diet.service';

describe('MinimumAcceptableDietStorageService', () => {
  let service: MinimumAcceptableDietStorageService;
  let sqliteServiceMock: any;
  let toastServiceMock: any;
  let syncStorageServiceMock: any;
  let dbConnectionMock: any;

  beforeEach(() => {
    sqliteServiceMock = jasmine.createSpyObj('SQLiteService', ['retrieveConnection']);
    toastServiceMock = jasmine.createSpyObj('ToastService', ['openToast']);
    syncStorageServiceMock = jasmine.createSpyObj('SyncStorageService', [
      'addTransactionInQueue',
      'deleteQueueByTableAndTransactionId',
    ]);

    dbConnectionMock = jasmine.createSpyObj('SQLiteDBConnection', ['query', 'run']);
    sqliteServiceMock.retrieveConnection.and.returnValue(Promise.resolve(dbConnectionMock));

    TestBed.configureTestingModule({
      providers: [
        MinimumAcceptableDietStorageService,
        { provide: 'SQLiteService', useValue: sqliteServiceMock },
        { provide: 'ToastService', useValue: toastServiceMock },
        { provide: 'SyncStorageService', useValue: syncStorageServiceMock },
      ],
    });
    service = TestBed.inject(MinimumAcceptableDietStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeDatabase', () => {
    it('should initialize the database and load client minimum acceptable diet', async () => {
      spyOn(service, 'getClientMinimumAcceptableDiet').and.callThrough();

      await service.initializeDatabase();

      expect(service.getDbConnection()).toBe(dbConnectionMock);
      expect(service.getClientMinimumAcceptableDiet).toHaveBeenCalled();
    });

    it('should handle errors during database initialization', async () => {
      const error = new Error('Database error');
      sqliteServiceMock.retrieveConnection.and.returnValue(Promise.reject(error));
      spyOn(console, 'log');

      await service.initializeDatabase();

      expect(console.log).toHaveBeenCalledWith('database init', error);
    });
  });

  describe('addClientMinimumAcceptableDiet', () => {
    it('should add client minimum acceptable diet and handle different cases', async () => {
      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet[] = [
        {
          ClientId: '1',
          MinimumAcceptableDietId: 1,
          Frequency: 3,
          TransactionId: '1',
          OnlineDbOid: '1',
          CreatedBy: '1',
        },
        { ClientId: '2', MinimumAcceptableDietId: 2, Frequency: 2, TransactionId: '2', CreatedBy: '1' },
        { ClientId: '3', MinimumAcceptableDietId: 3, Frequency: 1, CreatedBy: '1' },
      ];

      dbConnectionMock.run.and.returnValue(Promise.resolve({ changes: 1 } as capSQLiteChanges));

      const responses = await service.addClientMinimumAcceptableDiet(clientMinimumAcceptableDiet);

      expect(responses.length).toBe(3);
      expect(syncStorageServiceMock.deleteQueueByTableAndTransactionId).toHaveBeenCalled();
      expect(syncStorageServiceMock.addTransactionInQueue).toHaveBeenCalled();
      expect(dbConnectionMock.run).toHaveBeenCalled();
    });
  });

  describe('updateClientMinimumAcceptableDietById', () => {
    it('should update client minimum acceptable diet by id', async () => {
      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet = {
        ClientId: '1',
        MinimumAcceptableDietId: 1,
        Frequency: 3,
        TransactionId: '1',
        CreatedBy: '1',
      };

      dbConnectionMock.run.and.returnValue(Promise.resolve());

      await service.updateClientMinimumAcceptableDietById('1', clientMinimumAcceptableDiet);

      expect(dbConnectionMock.run).toHaveBeenCalled();
      expect(service.getClientMinimumAcceptableDiet).toHaveBeenCalled();
      expect(toastServiceMock.openToast).toHaveBeenCalledWith({
        message: 'Client minimum acceptable diet updated successfully',
        color: 'success',
      });
    });

    it('should handle errors during update', async () => {
      const error = new Error('Update error');
      dbConnectionMock.run.and.returnValue(Promise.reject(error));

      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet = {
        ClientId: '1',
        MinimumAcceptableDietId: 1,
        Frequency: 3,
        TransactionId: '1',
        CreatedBy: '1',
      };

      await service.updateClientMinimumAcceptableDietById('1', clientMinimumAcceptableDiet);

      expect(toastServiceMock.openToast).toHaveBeenCalledWith({
        message: 'Error updating client minimum acceptable diet',
        color: 'error',
      });
    });
  });

  describe('deleteClientMinimumAcceptableDietById', () => {
    it('should delete client minimum acceptable diet by id', async () => {
      dbConnectionMock.run.and.returnValue(Promise.resolve());

      await service.deleteClientMinimumAcceptableDietById('1');

      expect(dbConnectionMock.run).toHaveBeenCalled();
      expect(service.getClientMinimumAcceptableDiet).toHaveBeenCalled();
    });

    it('should handle errors during deletion', async () => {
      const error = new Error('Deletion error');
      dbConnectionMock.run.and.returnValue(Promise.reject(error));

      await service.deleteClientMinimumAcceptableDietById('1');

      expect(console.error).toHaveBeenCalledWith('Error deleting client minimum acceptable diet:', error);
    });
  });

  describe('loadMinimumAcceptableDiet', () => {
    it('should load all minimum acceptable diet from the database', async () => {
      const minimumAcceptableDiet: MinimumAcceptableDiet[] = [
        { Oid: 1, Description: 'Diet 1', IsDeleted: false },
        { Oid: 2, Description: 'Diet 2' },
      ];

      dbConnectionMock.query.and.returnValue(Promise.resolve({ values: minimumAcceptableDiet }));

      await service.loadMinimumAcceptableDiet();

      expect(service.minimumAcceptableDietList.value).toEqual(minimumAcceptableDiet);
    });
  });

  describe('loadClientMinimumAcceptableDiet', () => {
    it('should load all client minimum acceptable diet from the database', async () => {
      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet[] = [
        { ClientId: '1', MinimumAcceptableDietId: 1, Frequency: 3, CreatedBy: '1' },
        { ClientId: '2', MinimumAcceptableDietId: 2, Frequency: 2, CreatedBy: '1' },
      ];

      dbConnectionMock.query.and.returnValue(Promise.resolve({ values: clientMinimumAcceptableDiet }));

      await service.loadClientMinimumAcceptableDiet();

      expect(service.clientMinimumAcceptableDietList.value).toEqual(clientMinimumAcceptableDiet);
    });
  });

  describe('getClientMinimumAcceptableDietByClientId', () => {
    it('should get client minimum acceptable diet by client id', async () => {
      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet = {
        ClientId: '1',
        MinimumAcceptableDietId: 1,
        Frequency: 3,
        CreatedBy: '1',
      };

      dbConnectionMock.query.and.returnValue(Promise.resolve({ values: [clientMinimumAcceptableDiet] }));

      const result = await service.getClientMinimumAcceptableDietByClientId('1');

      expect(result).toEqual(clientMinimumAcceptableDiet);
    });
  });

  describe('getClientMinimumAcceptableDietById', () => {
    it('should get client minimum acceptable diet by id', async () => {
      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet = {
        ClientId: '1',
        MinimumAcceptableDietId: 1,
        Frequency: 3,
        CreatedBy: '1',
      };

      dbConnectionMock.query.and.returnValue(Promise.resolve({ values: [clientMinimumAcceptableDiet] }));

      const result = await service.getClientMinimumAcceptableDietById('1');

      expect(result).toEqual(clientMinimumAcceptableDiet);
    });
  });

  describe('getClientsMinimumAcceptableDietByClientIds', () => {
    it('should get clients minimum acceptable diet by client ids', async () => {
      const clientMinimumAcceptableDiet: ClientMinimumAcceptableDiet[] = [
        { ClientId: '1', MinimumAcceptableDietId: 1, Frequency: 3, CreatedBy: '1' },
        { ClientId: '2', MinimumAcceptableDietId: 2, Frequency: 2, CreatedBy: '1' },
      ];

      dbConnectionMock.query.and.returnValue(Promise.resolve({ values: clientMinimumAcceptableDiet }));

      const result = await service.getClientsMinimumAcceptableDietByClientIds(['1', '2']);

      expect(result).toEqual(clientMinimumAcceptableDiet);
    });
  });
});
