'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import classes from './NavLinks.module.css';

export default function NavLinks() {
  const t = useTranslations('HomePage');

  const links = [
    { href: '/client', label: t('clientNavLink') },
    { href: '/history', label: t('historyLink') },
    { href: '/variables', label: t('variablesLink') },
  ];

  const pathname = usePathname();

  return (
    <div className={classes.links}>
      {links.map((link, index) => {
        const isActive = pathname === link.href;
        return (
          <Link key={index} href={link.href} className={isActive ? 'active-link' : ''}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
