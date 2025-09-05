'use client';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import classes from './Header.module.css';

export default function Header() {
  const t = useTranslations('HomePage');

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}>
      <div className={`container ${classes['flex-wrapper']}`}>
        <h1>{t('title')}</h1>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
