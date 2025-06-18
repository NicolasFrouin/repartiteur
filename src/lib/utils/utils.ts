import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugify from 'slugify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSlug(str: string = ''): string {
  return slugify(str, {
    locale: 'fr',
    remove: /[^\w -]/g,
    lower: true,
    replacement: '-',
    trim: true,
  });
}
