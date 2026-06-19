'use client';

export default function Spinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const borderSizes = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${sizes[size]}`}>
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border ${borderSizes[size]} border-emerald-200`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border ${borderSizes[size]} border-t-emerald-700 border-r-gold-400 animate-spin`} />
      </div>
      {text && <p className="text-sm text-emerald-700 font-medium animate-pulse">{text}</p>}
    </div>
  );
}
