import { Branch, Mission, Sector } from '@/prisma/generated/client';

type NotRequired = 'id' | 'color' | 'active' | 'createdAt' | 'updatedAt' | `${string}Id`;

export type NonRequired<T, O extends keyof T = never> = {
  [K in keyof T as K extends NotRequired | O ? never : K]-?: T[K];
} & Partial<Pick<T, Extract<keyof T, NotRequired | O>>>;

export type BranchesSectorsMissions = Branch & { sectors: (Sector & { missions: Mission[] })[] };
/** @alias {@link BranchesSectorsMissions} */
export type BSM = BranchesSectorsMissions;
