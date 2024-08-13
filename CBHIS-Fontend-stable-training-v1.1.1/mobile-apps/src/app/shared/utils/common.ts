// export const SexOptions: { key: string; value: number }[] = [
//   { key: 'Male', value: 1 },
//   { key: 'Female', value: 2 },
//   { key: 'Unknown', value: 3 },
// ];

// export const MaritalStatusOptions: { key: string; value: number }[] = [
//   { key: 'Single', value: 1 },
//   { key: 'Married', value: 2 },
//   { key: 'Widowed', value: 3 },
//   { key: 'Divorced', value: 4 },
//   { key: 'Separated', value: 5 },
// ];

// export const EducationLevelOptions: {
//   key: string;
//   value: number;
// }[] = [
//   { key: 'Primary', value: 1 },
//   { key: 'Secondary', value: 2 },
//   { key: 'High School', value: 3 },
//   { key: 'Tertiary', value: 4 },
// ];

export const RelationTypeOptions: {
  key: string;
  value: number;
}[] = [
  { key: 'Babe', value: 1 },
  { key: 'Make', value: 2 },
  { key: 'Bhuti', value: 3 },
  { key: 'Sisi', value: 4 },
  { key: 'Indvodzana', value: 5 },
  { key: 'Indvodzakati', value: 6 },
  { key: 'Umfati', value: 7 },
];

// Mock Data

// export const DrinkingWaterSources = [
//   { Oid: 1, value: 'Piped to yard/plot' },
//   { Oid: 2, value: 'Public tap/standpipe' },
//   { Oid: 3, value: 'Borehole' },
//   { Oid: 4, value: 'Protected well' },
//   { Oid: 5, value: 'Unprotected well' },
//   { Oid: 6, value: 'Rain water' },
//   { Oid: 7, value: 'Tanker truck' },
//   { Oid: 8, value: 'Surface water' },
//   { Oid: 9, value: 'Bottled water' },
//   { Oid: 10, value: 'Other' },
// ];

// export const SafeWaterSources = [
//   { Oid: 1, value: 'Boil' },
//   { Oid: 2, value: 'Add bleach/chlorine/jik' },
//   { Oid: 3, value: 'Strain through a cloth' },
//   { Oid: 4, value: 'Use water filter' },
//   { Oid: 5, value: 'Solar disinfection' },
//   { Oid: 6, value: 'Let it stand and settle' },
//   { Oid: 7, value: 'Other' },
//   { Oid: 8, value: "Don't know" },
//   { Oid: 9, value: 'None' },
// ];

// export const WASHs = [
//   { Oid: 1, value: 'Flush or pour flush toilet' },
//   { Oid: 2, value: 'Ordinary pit toilet' },
//   { Oid: 3, value: 'Ventilated improved privy' },
//   { Oid: 4, value: 'No facility/bush/field' },
//   { Oid: 5, value: 'Waste disposal facility' },
//   { Oid: 6, value: 'Waste segregation' },
//   { Oid: 7, value: 'Non-biodegradable waste management' },
//   { Oid: 8, value: 'Yard grooming' },
//   { Oid: 9, value: 'Presence of Stagnant water in yard' },
//   { Oid: 10, value: 'Other' },
// ];

export const generateGUID = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

// * Language Switcher
export const isEnglish = false;
