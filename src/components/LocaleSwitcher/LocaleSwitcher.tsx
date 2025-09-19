'use client';

import { Locale, useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import classes from './LocaleSwitcher.module.css';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const defaultValue = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    startTransition(() => {
      router.replace({ pathname, params } as Parameters<typeof router.replace>[0], {
        locale: nextLocale,
      });
    });
  }

  return (
    <label>
      <p className='sr-only'>{t('label')}</p>
      <select
        id='locale-switcher'
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={onSelectChange}
        className={classes.select}
      >
        {routing.locales.map((locale) => (
          <option key={locale} value={locale}>
            {t(locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
