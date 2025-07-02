import {
  Assignment,
  Branch,
  Caregiver,
  CaregiverSector,
  Mission,
  Sector,
  User,
} from '@/generated/client';

type NotRequired =
  | 'id'
  | 'slug'
  | 'color'
  | 'active'
  | 'archived'
  | 'createdAt'
  | 'updatedAt'
  | `${string}Id`;

export type NonRequired<T, O extends keyof T = never> = {
  [K in keyof T as K extends NotRequired | O ? never : K]-?: T[K];
} & Partial<Pick<T, Extract<keyof T, NotRequired | O>>>;

export type BranchesSectorsMissions = Branch & { sectors: (Sector & { missions: Mission[] })[] };
/** @alias {@link BranchesSectorsMissions} */
export type BSM = BranchesSectorsMissions;

/**
 * A `FullCaregiver` is a `Caregiver` with :
 * - `branch` : {@link Branch} the branch the caregiver belongs to
 * - `assignedSectors` : {@link FullCaregiverSector[]} the sectors assigned to the caregiver
 * - `updatedBy` (optional) : {@link User} the user who updated the caregiver
 */
export type FullCaregiver = Caregiver & {
  branch: Branch;
  assignedSectors: FullCaregiverSector[];
  updatedBy?: User | null;
};

/**
 * A `FullAssignment` is an `Assignment` with :
 * - `caregiver` : {@link Caregiver} the caregiver assigned to the mission
 * - `mission` : {@link Mission} the mission assigned to the caregiver
 * - `updatedBy` (optional) : {@link User} the user who updated the assignment
 */
export type FullAssignment = Assignment & {
  caregiver: Caregiver;
  mission: Mission;
  updatedBy?: User | null;
};

/**
 * A `FullCaregiverSector` is a `CaregiverSector` with :
 * - `caregiver` (optional) : {@link Caregiver} the caregiver assigned to the sector
 * - `sector` (optional) : {@link Sector} the sector assigned to the caregiver
 */
export type FullBranch = Branch & { sectors: Sector[]; updatedBy?: User | null };

/** A `FullSector` is a `Sector` with :
 * - `missions` : {@link Mission[]} the missions assigned to the sector
 * - `branch` : {@link Branch} the branch the sector belongs to
 * - `assignedCaregivers` (optional) : {@link Caregiver[]} the caregivers assigned to the sector
 * - `updatedBy` (optional) : {@link User} the user who updated the sector
 */
export type FullSector = Sector & {
  missions: Mission[];
  branch: Branch;
  assignedCaregivers?: Caregiver[];
  updatedBy?: User | null;
};

/** A `FullMission` is a `Mission` with :
 * - `sector` : {@link FullSector} the sector the mission belongs to
 * - `updatedBy` (optional) : {@link User} the user who updated the mission
 */
export type FullMission = Mission & {
  sector: Omit<FullSector, 'missions'>;
  updatedBy?: User | null;
};

/**
 * A `FullCaregiverSector` is a `CaregiverSector` with :
 * - `caregiver` (optional) : {@link Caregiver} the caregiver assigned to the sector
 * - `sector` (optional) : {@link Sector} the sector assigned to the caregiver
 */
export type FullCaregiverSector = CaregiverSector & { caregiver?: Caregiver; sector?: Sector };

export type TCalendarOptions = { date: string; recurence: boolean };
