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

export type FullCaregiver = Caregiver & {
  branch: Branch;
  assignedSectors: CaregiverSector[];
  updatedBy?: User | null;
};
export type FullAssignment = Assignment & {
  caregiver: Caregiver;
  mission: Mission;
  updatedBy?: User | null;
};
export type FullBranch = Branch & { sectors: Sector[]; updatedBy?: User | null };
export type FullSector = Sector & {
  missions: Mission[];
  branch: Branch;
  assignedCaregivers?: Caregiver[];
  updatedBy?: User | null;
};
export type FullMission = Mission & {
  sector: Omit<FullSector, 'missions'>;
  updatedBy?: User | null;
};

export type TCalendarOptions = { date: string; recurence: boolean };
