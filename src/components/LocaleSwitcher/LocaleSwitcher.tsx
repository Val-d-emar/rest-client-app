import { routing } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <select>
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {t(locale)}
        </option>
      ))}
    </select>
  );
}
