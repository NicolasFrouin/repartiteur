// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use server';

import prisma from '@/prisma';

export async function fetchUser<T extends typeof prisma.user>(
  functionName: keyof T,
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  return await prisma.user[functionName](...args);
}

export async function fetchCaregiver<T extends typeof prisma.caregiver>(
  functionName: keyof T,
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  return await prisma.caregiver[functionName](...args);
}

export async function fetchBranch<T extends typeof prisma.branch>(
  functionName: keyof T,
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  return await prisma.branch[functionName](...args);
}

export async function fetchSector<T extends typeof prisma.sector>(
  functionName: keyof T,
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  return await prisma.sector[functionName](...args);
}

export async function fetchMission<T extends typeof prisma.mission>(
  functionName: keyof T,
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  return await prisma.mission[functionName](...args);
}

export async function fetchAssignment<T extends typeof prisma.assignment>(
  functionName: keyof T,
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  return await prisma.assignment[functionName](...args);
}
