'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Sync <html lang> with the ?lang= query param on the client.
 * The root layout cannot see searchParams (it's a Server Component),
 * so this runs after hydration to correct the attribute for FI pages.
 * Fails gracefully on first paint — SSR still emits lang="en".
 */
export function LangSync() {
  const params = useSearchParams();
  const lang = params.get('lang') === 'fi' ? 'fi' : 'en';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null;
}
