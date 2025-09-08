'use client';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import classes from './MainPage.module.css';
import { useAuth } from '@/context/AuthContext';

type Props = {
  // isLoggedIn: boolean;
  // user?: string;
};

export default function MainPage() {
  const t = useTranslations('HomePage');
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  return (
    <section className={`card ${classes['main-card']}`}>
      {!isLoggedIn && (
        <>
          <h1>{t('welcomeUnauth')}</h1>
          <div className={classes.controls}>
            <Link href='/auth/signin' className={classes.button}>
              {t('SignInLabel')}
            </Link>
            <Link href='/auth/signup' className={classes.button}>
              {t('SignUpLabel')}
            </Link>
          </div>
        </>
      )}
      {isLoggedIn && (
        <>
          <h1>{t('welcomeAuth', { user: user?.displayName ?? t('defaultUser') })}</h1>
          <div className={classes.controls}>
            <Link href='/client' className={classes.button}>
              {t('clientLink')}
            </Link>
            <Link href='/history' className={classes.button}>
              {t('historyLink')}
            </Link>
            <Link href='/variables' className={classes.button}>
              {t('variablesLink')}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
