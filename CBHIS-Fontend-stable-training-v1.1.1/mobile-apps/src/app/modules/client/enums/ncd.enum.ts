export enum TestOutcome {
  Positive = 1,
  Negative,
}

export enum ScreeningOutcome {
  Presumptive = 1,
  NonPresumptive,
}

/// <summary>
/// This enum is used to represent water intake levels.
/// </summary>
export enum WaterIntake {
  LessThan3Glasses = 1,
  ThreeTo5Glasses,
  MoreThan5Glasses,
}

/// <summary>
/// This enum is used to represent breathing difficulty frequency.
/// </summary>
export enum BreathingDifficulty {
  // [Description("Never")]
  Never = 1,

  // [Description("Rarely (1-2 times a week)")]
  Rarely,

  // [Description("Sometimes (3-4 times a week)")]
  Sometimes,

  // [Description("Often (5 or more times a week)")]
  Often,
}

/// <summary>
/// This enum is used to represent exercise duration.
/// </summary>
export enum Exercise {
  // [Description("None")]
  None = 1,

  // [Description("1-2 hours")]
  OneTo2Hours,

  // [Description("3-5 hours")]
  ThreeTo5Hours,

  // [Description("More than 5 hours")]
  MoreThan5Hours,
}

/// <summary>
/// This enum is used to represent heart rate raising activity duration.
/// </summary>
export enum HeartRateRaisingActivity {
  // [Description("None")]
  None = 1,

  // [Description("1-2 hours")]
  OneTo2Hours,

  // [Description("3-5 hours")]
  ThreeTo5Hours,

  // [Description("More than 5 hours")]
  MoreThan5Hours,
}

/// <summary>
/// This enum is used to represent vegetable consumption frequency.
/// </summary>
export enum VegetableConsumption {
  // [Description("Rarely (1-2 times a week)")]
  Rarely = 1,

  // [Description("Sometimes (3-4 times a week)")]
  Sometimes,

  // [Description("Often (5-6 times a week)")]
  Often,

  // [Description("Daily")]
  Daily,
}

/// <summary>
/// This enum is used to represent fruit consumption frequency.
/// </summary>
export enum FruitConsumption {
  // [Description("Rarely (1-2 times a week)")]
  Rarely = 1,

  // [Description("Sometimes (3-4 times a week)")]
  Sometimes,

  // [Description("Often (5-6 times a week)")]
  Often,

  // [Description("Daily")]
  Daily,
}

/// <summary>
/// This enum is used to represent salt intake levels.
/// </summary>
export enum SaltIntake {
  // [Description("Very little")]
  VeryLittle = 1,
  // [Description("Moderate")]
  Moderate,
  // [Description("High")]
  High,
}

/// <summary>
/// This enum is used to represent alcohol consumption levels.
/// </summary>
export enum AlcoholConsumption {
  // [Description("None")]
  None = 1,
  // [Description("Occasional")]
  Occasional,
  // [Description("Regular")]
  Regular,
  // [Description("Heavy")]
  Heavy,
}
