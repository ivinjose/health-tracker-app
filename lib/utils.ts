import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Builds a single className string from mixed inputs, then resolves Tailwind conflicts.
 *
 * Falsy values are ignored. When two utilities set the same CSS property, the
 * last one in the argument list wins.
 *
 * @param inputs - Class names, arrays, or conditional objects accepted by `clsx`.
 * @returns A merged class string with conflicting Tailwind utilities removed.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
