'use server';

import prisma from '@/lib/prisma';

export async function fetchUser<T extends typeof prisma.user>(
  functionName: keyof typeof prisma.user,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  // @ts-expect-error ---
  return await prisma.user[functionName](...args);
}

export async function fetchCaregiver<T extends typeof prisma.caregiver>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  // @ts-expect-error ---
  return await prisma.caregiver[functionName](...args);
}

export async function fetchBranch<T extends typeof prisma.branch>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  // @ts-expect-error ---
  return await prisma.branch[functionName](...args);
}

export async function fetchSector<T extends typeof prisma.sector>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  // @ts-expect-error ---
  return await prisma.sector[functionName](...args);
}

export async function fetchMission<T extends typeof prisma.mission>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  // @ts-expect-error ---
  return await prisma.mission[functionName](...args);
}

export async function fetchAssignment<T extends typeof prisma.assignment>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
) {
  // @ts-expect-error ---
  return await prisma.assignment[functionName](...args);
}
