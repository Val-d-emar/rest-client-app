'use client';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';

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
        <Link href='/'>
          <h1>{t('title')}</h1>
        </Link>

        <div className={classes.controls}>
          <LocaleSwitcher />
          {/* TODO: отображать кнопки в зависимости от состояния юзера */}
          <button>{t('SignInLabel')}</button>
          <button>{t('SignUpLabel')}</button>
          {/* <button>{t('SignOutLabel')}</button> */}
        </div>
      </div>
    </header>
  );
}
