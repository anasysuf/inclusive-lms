'use client';

/**
 * =========================================================================
 * KOMPONEN BADGE / PILL AKSESIBEL & RESPONSIF (WCAG 2.1 LEVEL AA)
 * =========================================================================
 * - Ukuran teks responsif (text-[11px] sm:text-xs) dan konsisten.
 * - Kontras warna tinggi (>4.5:1) dengan border penegas.
 * - Format flex anti-overflow (whitespace-nowrap & shrink-0).
 */

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'a11y';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary border-primary/30 font-bold',
    secondary: 'bg-secondary text-secondary-foreground border-border font-medium',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold',
    warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold',
    destructive: 'bg-destructive/15 text-destructive border-destructive/40 font-bold',
    outline: 'border-2 border-border text-foreground bg-background/50 font-medium',
    a11y: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-bold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] sm:text-xs tracking-tight transition-colors select-none',
          variants[variant],
          className
        )
      )}
      {...props}
    />
  );
}
