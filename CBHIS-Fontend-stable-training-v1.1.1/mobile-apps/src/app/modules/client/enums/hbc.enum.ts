export enum Condition {
  LooksHealthy = 1,
  LooksWeak = 2,
  LooksThin = 3,
  Bedridden = 4,
  NotHome = 5,
  TransferredOut = 6,
  WantsToStopVisits = 7,
  Died = 8,
  Unknown = 9,
}

export enum ReasonForDischarge {
  Recovered = 1,
  Died = 2,
  Relocated = 3,
}
