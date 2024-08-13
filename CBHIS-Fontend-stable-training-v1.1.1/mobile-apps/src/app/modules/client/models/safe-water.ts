import { BaseEntity } from 'src/app/shared/models/base-entity';

export interface SafeWater extends BaseEntity {
  boil: number;
  addbleachchlorinejik: number;
  strainthroughcloth: number;
  usewaterfilter: number;
  solardisinfection: number;
  letitstandandsettle: number;
  other: number;
  dontknow: number;
  none: number;
  identifiedfamilyid: number;
}
