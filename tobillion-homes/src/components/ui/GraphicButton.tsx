'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface GraphicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  href?: string;
}

export function GraphicButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: GraphicButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl hover:scale-105 border-2 transition-all duration-300 focus-ring';

  const variants = {
    primary: 'bg-emerald-700 text-white border-emerald-700 hover:border-gold-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    secondary: 'bg-white text-emerald-800 border-gold-400 hover:border-gold-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    outline: 'bg-transparent text-white border-2 border-white/30 hover:bg-white/10 hover:border-white/60',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
