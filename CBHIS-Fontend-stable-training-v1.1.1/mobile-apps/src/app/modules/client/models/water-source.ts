import { BaseEntity } from 'src/app/shared/models/base-entity';

export interface WaterSource extends BaseEntity {
  pipedtoyardplot: number;
  publictapstandpipe: number;
  borehole: number;
  protectedwell: number;
  unprotectedwell: number;
  rainwater: number;
  tankertruck: number;
  surfacewater: number;
  bottledwater: number;
  other: number;
  identifiedfamilyid: number;
}
