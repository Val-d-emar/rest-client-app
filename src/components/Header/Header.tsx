'use client';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
      <nav className={`container ${classes['flex-wrapper']}`}>
        <Link href='/' className={classes['logo-wrapper']}>
          <Image src='/logo.png' alt={t('logoAlt')} width={60} height={60} priority={true} />
          <span className={classes.brandText}>{t('title')}</span>
        </Link>

        <div className={classes.controls}>
          <LocaleSwitcher />
          {/* TODO: отображать кнопки в зависимости от состояния юзера */}
          <Link href='/auth/signin' className={classes.button}>
            {t('SignInLabel')}
          </Link>
          <Link href='/auth/signup' className={classes.button}>
            {t('SignUpLabel')}
          </Link>
          {/* <Link href='/'>{t('SignOutLabel')}</Link> */}
        </div>
      </nav>
    </header>
  );
}
