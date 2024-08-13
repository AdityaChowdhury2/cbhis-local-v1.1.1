// ticket routes
export const URLTaskAssignments = (): string => "/task-assignments";
export const URLSettings = (): string => "/settings";
export const URLUsers = (): string => "/users";
export const URLDashboard = (): string => "/dashboard";

// * Settings
export const URLRegions = (): string => "/settings/regions";

export const URLTinkhundla = (id): string =>
  "/settings/regions/tinkhundla/" + id;

export const URLChiefdoms = (id): string => "/settings/regions/chiefdoms/" + id;
export const URLVillage = (id): string => "/settings/regions/village/" + id;
export const URLDevices = (): string => "/settings/devices";
export const URLWaterSource = (): string => "/settings/water-source";
export const URLSafeWater = (): string => "/settings/safe-water";
export const URLWASH = (): string => "/settings/wash";
export const URLHealthEducation = (): string => "/settings/health-education";
export const URLAncTopic = (): string => "/settings/anc-topic";
export const URLFpMethod = (): string => "/settings/fp-method";

export const URLPasswordRecovery = (): string => "/settings/password-recovery";
// export const URLTaskAssignments = (id: string = ":id"): string => `/tickets/${id}`;
