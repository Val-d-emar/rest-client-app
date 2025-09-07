'use client';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Link, useRouter } from '@/i18n/navigation';

import classes from './Header.module.css';

import { useAuth } from '@/context/AuthContext';
import { err } from '@/log';

export default function Header() {
  const t = useTranslations('HomePage');

  const [scrolled, setScrolled] = useState(false);

  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();

      router.push('/');
    } catch (error) {
      err('Failed to sign out:', error);
    }
  };

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
          {/* <Link href='/auth/signin' className={classes.button}>
            {t('SignInLabel')}
          </Link>
          <Link href='/auth/signup' className={classes.button}>
            {t('SignUpLabel')}
          </Link> */}
          {/* <Link href='/'>{t('SignOutLabel')}</Link> */}
          {/* 
            >>> NEW: Динамическое отображение кнопок <<<
            Мы используем состояние `user` из контекста.
            Пока идет `loading`, мы ничего не показываем, чтобы избежать "мигания" кнопок.
          */}
          {!loading && (
            <>
              {user ? (
                <button onClick={handleSignOut} className={classes.button}>
                  {t('SignOutLabel')}
                </button>
              ) : (
                <>
                  <Link href='/auth/signin' className={classes.button}>
                    {t('SignInLabel')}
                  </Link>
                  <Link href='/auth/signup' className={classes.button}>
                    {t('SignUpLabel')}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
