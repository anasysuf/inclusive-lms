'use client';

/**
 * =========================================================================
 * KOMPONEN BADGE / PILL AKSESIBEL & RESPONSIF ZOOM (WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Skalabel penuh saat di-zoom in/out (90% - 200%+).
 * - Mendukung text-wrap anggun saat resolusi sempit atau zoom ekstrem.
 * - Kontras warna terverifikasi WCAG AA (>4.5:1) dengan border penegas.
 */

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'a11y';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary border-primary/40 font-bold',
    secondary: 'bg-secondary text-secondary-foreground border-border font-medium',
    success: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 font-bold',
    warning: 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold',
    destructive: 'bg-destructive/15 text-destructive border-destructive/40 font-bold',
    outline: 'border-2 border-border text-foreground bg-background/60 font-medium',
    a11y: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/40 font-bold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-normal max-w-full text-center transition-colors select-none break-words',
          variants[variant],
          className
        )
      )}
      {...props}
    />
  );
}
