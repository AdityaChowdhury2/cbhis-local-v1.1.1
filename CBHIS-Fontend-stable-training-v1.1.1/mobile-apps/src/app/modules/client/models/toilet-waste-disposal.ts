import { BaseEntity } from 'src/app/shared/models/base-entity';

export interface ToiletAndWasteDisposal extends BaseEntity {
  flushorpourflushtoilet: number;
  ordinarypittoilet: number;
  ventilatedimprovedprivy: number;
  nofacilitybushfield: number;
  wastedisposalfacility: number;
  wastesegregation: number;
  nonbiodegradablewasemanagement: number;
  yardgrooming: number;
  presenceofstagnantwaterinyard: number;
  other: number;
  identifiedfamilyid: number;
}
