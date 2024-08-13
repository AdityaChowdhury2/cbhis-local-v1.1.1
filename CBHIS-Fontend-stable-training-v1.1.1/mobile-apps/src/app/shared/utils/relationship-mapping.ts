import { Gender } from '../enums/gender.enum';

enum RelationalType {
  Father = 1,
  Mother = 2,
  Sister = 3,
  Brother = 4,
  Wife = 5,
  Husband = 6,
  Son = 7,
  Daughter = 8,
  Aunt = 9,
  Uncle = 10,
  Others = 11,
}

export const getOldHeadRelationship = (gender: Gender, oldHeadType: RelationalType) => {
  const headMapping = {
    [RelationalType.Father]:
      gender == Gender.Female
        ? RelationalType.Daughter
        : gender == Gender.Male
        ? RelationalType.Son
        : RelationalType.Others,
    [RelationalType.Mother]:
      gender == Gender.Female
        ? RelationalType.Daughter
        : gender == Gender.Male
        ? RelationalType.Son
        : RelationalType.Others,
    [RelationalType.Sister]:
      gender == Gender.Female
        ? RelationalType.Sister
        : gender == Gender.Male
        ? RelationalType.Brother
        : RelationalType.Others,
    [RelationalType.Brother]:
      gender == Gender.Female
        ? RelationalType.Sister
        : gender == Gender.Male
        ? RelationalType.Brother
        : RelationalType.Others,
    [RelationalType.Wife]: RelationalType.Husband,
    [RelationalType.Husband]: RelationalType.Wife,
    [RelationalType.Son]:
      gender == Gender.Female
        ? RelationalType.Mother
        : gender == Gender.Male
        ? RelationalType.Father
        : RelationalType.Others,
    [RelationalType.Daughter]:
      gender == Gender.Female
        ? RelationalType.Mother
        : gender == Gender.Male
        ? RelationalType.Father
        : RelationalType.Others,
    [RelationalType.Aunt]: RelationalType.Others,
    [RelationalType.Uncle]: RelationalType.Others,
    [RelationalType.Others]: RelationalType.Others,
  };

  return headMapping[oldHeadType];
};

//  Father = 1,  Father==>           -> Husband           -> Father
//  Mother = 2,   -> wife           Mother==>             -> Mother
//  Sister = 3,   -> Daughter        -> Daughter         Sister==
//  Brother = 4,  -> Son             -> Son               -> Brother
//  Son = 7,      -> grand-son       -> Grand-son         -> Others -nieces
//  Daughter = 8, -> grand-daughter  -> Grand-daughter    -> Others -nephew
//  Aunt = 9,     -> sister          -> Sister            -> Aunt
//  Uncle = 10,   -> brother         -> Brother           -> Uncle
//  Wife = 5,     -> Daughter-in-Law -> Daughter-in-law   -> Others - sister-in-law
//  Husband=6,    -> nothing         -> Nothing           -> Others
//  others = 11,  ->others           -> Others             -> Others

interface RelationshipMapping {
  [key: number]: {
    [key: number]: number;
  };
}

export const changeRelationshipMapping: RelationshipMapping = {
  [RelationalType.Father]: {
    [RelationalType.Father]: RelationalType.Father,
    [RelationalType.Mother]: RelationalType.Wife,
    [RelationalType.Sister]: RelationalType.Daughter,
    [RelationalType.Brother]: RelationalType.Son,
    [RelationalType.Son]: RelationalType.Others,
    [RelationalType.Daughter]: RelationalType.Others,
    [RelationalType.Aunt]: RelationalType.Sister,
    [RelationalType.Uncle]: RelationalType.Brother,
    [RelationalType.Wife]: RelationalType.Others,
    [RelationalType.Others]: RelationalType.Others,
  },
  [RelationalType.Mother]: {
    [RelationalType.Father]: RelationalType.Husband,
    [RelationalType.Mother]: RelationalType.Mother,
    [RelationalType.Sister]: RelationalType.Daughter,
    [RelationalType.Brother]: RelationalType.Son,
    [RelationalType.Son]: RelationalType.Others,
    [RelationalType.Daughter]: RelationalType.Others,
    [RelationalType.Aunt]: RelationalType.Sister,
    [RelationalType.Uncle]: RelationalType.Brother,
    [RelationalType.Wife]: RelationalType.Others,
    [RelationalType.Others]: RelationalType.Others,
  },
  [RelationalType.Sister]: {
    [RelationalType.Father]: RelationalType.Father,
    [RelationalType.Mother]: RelationalType.Mother,
    [RelationalType.Sister]: RelationalType.Sister,
    [RelationalType.Brother]: RelationalType.Brother,
    [RelationalType.Son]: RelationalType.Others,
    [RelationalType.Daughter]: RelationalType.Others,
    [RelationalType.Aunt]: RelationalType.Aunt,
    [RelationalType.Uncle]: RelationalType.Uncle,
    [RelationalType.Wife]: RelationalType.Others,
    [RelationalType.Others]: RelationalType.Others,
  },
  [RelationalType.Brother]: {
    [RelationalType.Father]: RelationalType.Father,
    [RelationalType.Mother]: RelationalType.Mother,
    [RelationalType.Sister]: RelationalType.Sister,
    [RelationalType.Brother]: RelationalType.Brother,
    [RelationalType.Son]: RelationalType.Others,
    [RelationalType.Daughter]: RelationalType.Others,
    [RelationalType.Aunt]: RelationalType.Aunt,
    [RelationalType.Uncle]: RelationalType.Uncle,
    [RelationalType.Wife]: RelationalType.Others,
    [RelationalType.Others]: RelationalType.Others,
  },
  [RelationalType.Son]: {
    [RelationalType.Father]: RelationalType.Others,
    [RelationalType.Mother]: RelationalType.Others,
    [RelationalType.Sister]: RelationalType.Aunt,
    [RelationalType.Brother]: RelationalType.Uncle,
    [RelationalType.Son]: RelationalType.Brother,
    [RelationalType.Daughter]: RelationalType.Sister,
    [RelationalType.Aunt]: RelationalType.Others,
    [RelationalType.Uncle]: RelationalType.Others,
    [RelationalType.Wife]: RelationalType.Mother,
    [RelationalType.Others]: RelationalType.Others,
  },
  [RelationalType.Daughter]: {
    [RelationalType.Father]: RelationalType.Others,
    [RelationalType.Mother]: RelationalType.Others,
    [RelationalType.Sister]: RelationalType.Aunt,
    [RelationalType.Brother]: RelationalType.Uncle,
    [RelationalType.Son]: RelationalType.Brother,
    [RelationalType.Daughter]: RelationalType.Sister,
    [RelationalType.Aunt]: RelationalType.Others,
    [RelationalType.Uncle]: RelationalType.Others,
    [RelationalType.Wife]: RelationalType.Father,
    [RelationalType.Others]: RelationalType.Others,
  },
};
