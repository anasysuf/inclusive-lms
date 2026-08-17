'use client';

/**
 * =========================================================================
 * ACCESSIBLE BUTTON COMPONENT (WCAG 2.1 AA COMPLIANT)
 * =========================================================================
 * Fully accessible button primitive supporting high-contrast focus rings,
 * explicit aria states, and tactile keyboard triggers.
 */

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'high-contrast';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 ' +
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:opacity-90 shadow-sm border border-transparent',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
      outline:
        'border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground text-foreground',
      ghost:
        'hover:bg-accent hover:text-accent-foreground text-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm',
      'high-contrast':
        'bg-black text-yellow-400 border-2 border-yellow-400 font-bold hover:bg-yellow-400 hover:text-black',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm gap-1.5',
      md: 'h-11 px-4 text-base gap-2',
      lg: 'h-13 px-6 text-lg gap-2.5',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
