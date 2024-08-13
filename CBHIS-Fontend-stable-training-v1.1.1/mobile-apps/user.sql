
CREATE TABLE IF NOT EXISTS LogoutActivity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      logout_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES useraccounts(id)
  );

  CREATE TABLE IF NOT EXISTS LoginActivity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT NOT NULL,
    device_info TEXT,
    ip_address TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES useraccounts(id)
  );

  CREATE TABLE IF NOT EXISTS CurrentLogin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES useraccounts(id)
  );



-- Create Chiefdoms Table
CREATE TABLE Chiefdoms (
    Oid INTEGER PRIMARY KEY,
    Description NVARCHAR(90) NOT NULL,
    InkhundlaId INTEGER NOT NULL,
    IsDeleted BIT NOT NULL
);

-- Create Villages Table
CREATE TABLE Villages (
    Oid INTEGER PRIMARY KEY,
    Description NVARCHAR(90) NOT NULL,
    ChiefdomId INTEGER NOT NULL,
    IsDeleted BIT NOT NULL
);

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
CREATE TABLE AssignedVillages (
    Oid INTEGER PRIMARY KEY,
    RHMid UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT NOT NULL,
    VillageId INTEGER NOT NULL,
    IsDeleted BIT NOT NULL
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
