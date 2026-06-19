import { ReactNode } from 'react';

interface MosaicGridProps {
  children: ReactNode;
  className?: string;
}

export function MosaicGrid({ children, className = '' }: MosaicGridProps) {
  return (
    <div className={`mosaic-grid ${className}`}>
      {children}
    </div>
  );
}

interface MosaicItemProps {
  children: ReactNode;
  cols?: number;
  rows?: number;
  className?: string;
}

export function MosaicItem({ children, cols = 4, rows = 1, className = '' }: MosaicItemProps) {
  return (
    <div
      className={`col-span-${cols} ${className}`}
      style={{
        gridColumn: `span ${cols}`,
      }}
    >
      {children}
    </div>
  );
}
