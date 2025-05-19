import { Assignment, Branch, Caregiver, Mission, Sector } from '@/generated/client';

type NotRequired = 'id' | 'color' | 'active' | 'createdAt' | 'updatedAt' | `${string}Id`;

export type NonRequired<T, O extends keyof T = never> = {
  [K in keyof T as K extends NotRequired | O ? never : K]-?: T[K];
} & Partial<Pick<T, Extract<keyof T, NotRequired | O>>>;

export type BranchesSectorsMissions = Branch & { sectors: (Sector & { missions: Mission[] })[] };
/** @alias {@link BranchesSectorsMissions} */
export type BSM = BranchesSectorsMissions;

export type FullAssignment = Assignment & { caregiver: Caregiver; mission: Mission };
export type FullBranch = Branch & { sectors: Sector[] };
export type FullSector = Sector & { missions: Mission[]; branch: Branch };
export type FullMission = Mission & { sector: Omit<FullSector, 'missions'> };
