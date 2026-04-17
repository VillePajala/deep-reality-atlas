'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

type Lang = 'en' | 'fi';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current: Lang = searchParams?.get('lang') === 'fi' ? 'fi' : 'en';

  const buildHref = (lang: Lang) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (lang === 'en') {
      params.delete('lang');
    } else {
      params.set('lang', lang);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const linkClass = (isActive: boolean) =>
    `text-[10px] tracking-[0.3em] uppercase transition-colors ${
      isActive ? 'text-neutral-300' : 'text-neutral-600 hover:text-neutral-400'
    }`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link href={buildHref('en')} className={linkClass(current === 'en')}>
        EN
      </Link>
      <span className="text-neutral-800">·</span>
      <Link href={buildHref('fi')} className={linkClass(current === 'fi')}>
        FI
      </Link>
    </div>
  );
}
