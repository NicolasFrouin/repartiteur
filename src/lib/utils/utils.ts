import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugify from 'slugify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number = 300) {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    // @ts-expect-error ---
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
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
