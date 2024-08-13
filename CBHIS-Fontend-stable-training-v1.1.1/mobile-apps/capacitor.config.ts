import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CBHIS LOCAL',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },

  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'cbhis/cbhis-databases',
      iosIsEncryption: false,
      iosKeychainPrefix: 'cbhis',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
        biometricSubTitle: 'Log in using your biometric',
      },
      electronIsEncryption: false,
      electronWindowsLocation: 'C:\\ProgramData\\cbhis-databases',
      electronMacLocation: '/Volumes/Development_Lacie/Development/Databases',
      electronLinuxLocation: 'Databases',
    },
  },
};

export default config;
