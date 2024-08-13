// models/service-models/post-natal.ts
export interface PostNatal {
  TransactionId?: string;
  ClientId: string;
  PlaceOfDelivery?: number | null;
  PostPartumLossOfBlood?: number | null;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
  PostNatalPreventativeServices?: PostNatalPreventativeService[];
  PostNatalDangerSigns?: PostNatalDangerSign[];
  PostNatalFeedingMethods?: PostNatalFeedingMethod[];
  PostNatalDepressions?: PostNatalDepression[];
}

export interface singlePnc {
  ClientId?: string;
  IsDeleted?: number | undefined | null;
  IsSynced?: null | undefined;
  OnlineDbOid?: null | undefined;
  PlaceOfDelivery: number | undefined | null;
  PostPartumLossOfBlood: number | undefined | null;
  TransactionId?: string | undefined;
}

export interface HivPreventativeService {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
}

export interface PostNatalPreventativeService {
  TransactionId?: string;
  PostNatalId: string;
  PreventativeServiceId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

// models/service-models/danger-sign.ts
export interface DangerSign {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
}

// models/service-models/post-natal-danger-sign.ts
export interface PostNatalDangerSign {
  TransactionId?: string;
  PostNatalId: string;
  DangerSignId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}

// models/service-models/feeding-method.ts
export interface FeedingMethod {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
}

// models/service-models/post-natal-feeding-method.ts
export interface PostNatalFeedingMethod {
  TransactionId?: string;
  PostNatalId: string;
  FeedingMethodId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}
// models/service-models/post-partum-depression.ts
export interface PostPartumDepression {
  Oid: number;
  Description: string;
  IsDeleted: boolean;
  IsSynced?: number;
  OnlineDbOid?: string;
}

// models/service-models/post-natal-depression.ts
export interface PostNatalDepression {
  TransactionId?: string;
  PostNatalId: string;
  PostPartumDepressionId: number;
  IsDeleted: boolean;
  IsSynced?: number;
  CreatedBy: string;
  ModifiedBy?: string;
  OnlineDbOid?: string;
}
