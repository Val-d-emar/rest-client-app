import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { err, log, warn } from '@/log';

export default function RootPage() {
  log('test logging');
  err('test error');
  warn('test warning');
  redirect({ href: '/', locale: `${routing.defaultLocale}` });
}
