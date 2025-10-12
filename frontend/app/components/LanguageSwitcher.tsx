'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

interface LanguageSwitcherProps {
  darkMode?: boolean;
}

export default function LanguageSwitcher({ darkMode = false }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    
    startTransition(() => {
      // Remove current locale from pathname and add new one
      const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
      router.replace(`/${newLocale}${pathWithoutLocale}`);
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
        darkMode
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
      } shadow-lg hover:scale-105 disabled:opacity-50`}
      aria-label="Toggle language"
    >
      <span className="text-base">🌐</span>
      <span>{locale === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}