export const environment = {
  production: true,
  // baseUrl: 'https://staging-api.cbhis.arcapps.org/cbhis-api/',
  // baseUrl: 'https://api-cbhis-training.ihmafrica.com/cbhis-api/',
  // baseUrl: 'https://qacbhis.api.arcapps.org/cbhis-api/',
  // baseUrl: 'https://staging-myscript.arcapps.org/cbhis-api/',
  // baseUrl: 'https://api-cbhis-training.ihmafrica.com/cbhis-api/',
  baseUrl: 'http://10.255.89.31:8097/cbhis-api/',
  // baseUrl: 'http://192.168.10.171:9091/cbhis-api/',
  database: {
    name: 'cbhis',
    location: 'default',
    // Optional configurations
    androidDatabaseLocation: 'default',
    iosDatabaseLocation: 'Library',
  },
};
