import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-3 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <HiChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-emerald-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-emerald-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
