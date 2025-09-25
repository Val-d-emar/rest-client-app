import { defineRouting } from 'next-intl/routing';

const locales = ['en', 'ru'] as const;

export const routing = defineRouting({
  locales,

  defaultLocale: 'en',
});
