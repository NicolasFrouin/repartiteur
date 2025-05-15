'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function fetchUser<T extends typeof prisma.user>(
  functionName: keyof typeof prisma.user,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
  pathToRevalidate?: string,
) {
  // @ts-expect-error ---
  const res = await prisma.user[functionName](...args);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
  return res;
}

export async function fetchCaregiver<T extends typeof prisma.caregiver>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
  pathToRevalidate?: string,
) {
  // @ts-expect-error ---
  const res = await prisma.caregiver[functionName](...args);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
  return res;
}

export async function fetchBranch<T extends typeof prisma.branch>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
  pathToRevalidate?: string,
) {
  // @ts-expect-error ---
  const res = await prisma.branch[functionName](...args);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
  return res;
}

export async function fetchSector<T extends typeof prisma.sector>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
  pathToRevalidate?: string,
) {
  // @ts-expect-error ---
  const res = await prisma.sector[functionName](...args);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
  return res;
}

export async function fetchMission<T extends typeof prisma.mission>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
  pathToRevalidate?: string,
) {
  // @ts-expect-error ---
  const res = await prisma.mission[functionName](...args);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
  return res;
}

export async function fetchAssignment<T extends typeof prisma.assignment>(
  functionName: keyof T,
  // @ts-expect-error ---
  args: Parameters<T[keyof T]> = [] as unknown as Parameters<T[keyof T]>,
  pathToRevalidate?: string,
) {
  // @ts-expect-error ---
  const res = await prisma.assignment[functionName](...args);
  if (pathToRevalidate) {
    revalidatePath(pathToRevalidate);
  }
  return res;
}
