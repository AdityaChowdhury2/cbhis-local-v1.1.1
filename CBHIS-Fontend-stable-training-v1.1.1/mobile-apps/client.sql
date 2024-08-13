CREATE TABLE IF NOT EXISTS Regions (
    Oid INTEGER PRIMARY KEY AUTOINCREMENT,
    Description TEXT NOT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Tinkhundla (
    Oid INTEGER PRIMARY KEY AUTOINCREMENT,
    Description TEXT NOT NULL,
    RegionId INTEGER NOT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (RegionId) REFERENCES Regions(Oid)
);

CREATE TABLE IF NOT EXISTS Chiefdoms (
    Oid INTEGER PRIMARY KEY AUTOINCREMENT,
    Description TEXT NOT NULL,
    TinkhundlaId INTEGER NOT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (TinkhundlaId) REFERENCES Tinkhundla(Oid)
);

CREATE TABLE IF NOT EXISTS Villages (
    Oid INTEGER PRIMARY KEY AUTOINCREMENT,
    Description TEXT NOT NULL,
    ChiefdomId INTEGER NOT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (ChiefdomId) REFERENCES Chiefdoms(Oid)
);

CREATE TABLE IF NOT EXISTS Clients (
    Oid TEXT PRIMARY KEY,
    FirstName TEXT NOT NULL,
    MiddleName TEXT,
    LastName TEXT NOT NULL,
    Age INTEGER NOT NULL,
    DOB TEXT NOT NULL,
    Sex INTEGER NOT NULL,
    MaritalStatus INTEGER NOT NULL,
    PIN TEXT,
    Cellphone TEXT NOT NULL,
    EducationLevel INTEGER NOT NULL,
    Occupation TEXT,
    HasBirthCertificate INTEGER,
    IsDisabled INTEGER,
    IsDeceased INTEGER,
    DateDeceased TEXT,
    IsFamilyHead INTEGER,
    RelationWithFamilyHead INTEGER,
    FamilyHeadId TEXT,
    VillageId INTEGER NOT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (FamilyHeadId) REFERENCES Clients(Oid),
    FOREIGN KEY (VillageId) REFERENCES Villages(Oid)
);

CREATE TABLE IF NOT EXISTS TransactionRecords (
    Oid TEXT PRIMARY KEY,
    TableCode INTEGER NOT NULL,
    DateCreated TEXT NOT NULL,
    CreatedBy TEXT NOT NULL,
    DateModified TEXT,
    ModifiedBy TEXT
);

CREATE TABLE IF NOT EXISTS UploadStates (
    Oid TEXT PRIMARY KEY,
    TransactionRecordId TEXT NOT NULL,
    ActionState INTEGER NOT NULL,
    IsSynced INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (TransactionRecordId) REFERENCES TransactionRecords(Oid)
);


-- user's query according to Shakil vai
-- Create Devices Table
CREATE TABLE Devices (
    Oid INTEGER PRIMARY KEY,
    Description NVARCHAR(500) NOT NULL,
    IMEI_Number NVARCHAR(100) NOT NULL,
    DateCreated SMALLDATETIME NOT NULL,
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    DateModified SMALLDATETIME NOT NULL,
    ModifiedBy UNIQUEIDENTIFIER NOT NULL,
    IsSynced BIT NOT NULL,
    IsDeleted BIT NOT NULL
);

-- Create UserAccounts Table
CREATE TABLE UserAccounts (
    Oid UNIQUEIDENTIFIER PRIMARY KEY,
    FirstName NVARCHAR(30) NOT NULL,
    MiddleName NVARCHAR(30),
    LastName NVARCHAR(30) NOT NULL,
    PIN NVARCHAR(13) NOT NULL,
    Cellphone NVARCHAR(20) NOT NULL,
    Username NVARCHAR(90) NOT NULL,
    Password NVARCHAR(MAX) NOT NULL,
    UserType TINYINT NOT NULL,
    IsDeleted BIT NOT NULL
);

-- Create AssignedChiefdoms Table
CREATE TABLE AssignedChiefdoms (
    Oid INTEGER PRIMARY KEY,
    SupervisorId UNIQUEIDENTIFIER NOT NULL,
    ChiefdomId INTEGER NOT NULL,
    IsActive BIT NOT NULL,
    IsDeleted BIT NOT NULL
);

-- Create AssignedVillages Table
CREATE TABLE AssignedVillage (
    Oid INTEGER PRIMARY KEY,
    RHMid TEXT NOT NULL,
    IsActive INTEGER NOT NULL,
    VillageId INTEGER NOT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0
);

-- Create AssignedDevices Table
CREATE TABLE AssignedDevices (
    Oid INTEGER PRIMARY KEY,
    DateAssigned SMALLDATETIME NOT NULL,
    RHMid UNIQUEIDENTIFIER NOT NULL,
    DeviceId INTEGER NOT NULL,
    InUse BIT NOT NULL,
    IsDeleted BIT NOT NULL
);

CREATE TABLE IF NOT EXISTS AssignedAppointment (
      TransactionId TEXT PRIMARY KEY,
      UserId TEXT NOT NULL,
      AppointmentType TEXT NOT NULL,
      AppointmentDate TEXT NOT NULL,
      Details TEXT,
      ClientId TEXT NOT NULL,
      Status INTEGER NOT NULL,
      Priority INTEGER NOT NULL,
      IsDeleted INTEGER DEFAULT 0,
      IsSynced INTEGER,
      OnlineDbOid TEXT,
      FOREIGN KEY (ClientId) REFERENCES Client(Oid)
    );