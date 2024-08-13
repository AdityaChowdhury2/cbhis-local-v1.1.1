// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // baseUrl: 'https://jc5rdnrw-7114.asse.devtunnels.ms/cbhis-api/',
  // baseUrl: 'https://staging-api.cbhis.arcapps.org/cbhis-api/',
  baseUrl: 'http://10.255.89.31:8097/cbhis-api/',
  // baseUrl: 'http://192.168.10.171:9091/cbhis-api/',
  // baseUrl: 'https://staging-myscript.arcapps.org/cbhis-api/',
  // baseUrl: 'https://api-cbhis-training.ihmafrica.com/cbhis-api/',
  // baseUrl: 'https://qacbhis.api.arcapps.org/cbhis-api/',
  // baseUrl: 'https://rn6ncth1-7114.asse.devtunnels.ms/cbhis-api/',
  // baseUrl: 'https://k8xbp8ch-7114.asse.devtunnels.ms/cbhis-api/',

  database: {
    name: 'cbhis',
    location: 'default',
    // Optional configurations
    androidDatabaseLocation: 'default',
    iosDatabaseLocation: 'Library',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
