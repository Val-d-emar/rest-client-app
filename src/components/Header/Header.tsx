'use client';

import LocaleSwitcher from '@/components/LocaleSwitcher';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Link, useRouter } from '@/i18n/navigation';

import classes from './Header.module.css';

import { useAuth } from '@/context/AuthContext';
import { err } from '@/log';
import toast from 'react-hot-toast';
import NavLinks from '../NavLinks/NavLinks';

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
    const toastId = toast.loading(t('signingOut'));
    try {
      await signOut();
      toast.success(t('goodbye'), { id: toastId });
      router.push('/');
    } catch (error) {
      const errorMessage = (error as Error)?.message || t('signOutError');
      err(errorMessage);
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  return (
    <header className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}>
      <nav className={`container ${classes['flex-wrapper']}`}>
        <Link href='/' className={classes['logo-wrapper'] + ' active-link'}>
          <Image src='/logo.png' alt={t('logoAlt')} width={60} height={60} priority={true} />
        </Link>

        {user && (
          <div className={classes.links}>
            <NavLinks />
          </div>
        )}

        <div className={classes.controls}>
          <LocaleSwitcher />
          {!loading && (
            <>
              {user ? (
                <>
                  <button onClick={() => router.replace('/')} className={classes.button}>
                    {t('MainPage')}
                  </button>
                  <button onClick={handleSignOut} className={classes.button}>
                    {t('SignOutLabel')}
                  </button>
                </>
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
