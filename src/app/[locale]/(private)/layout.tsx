'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner/Spinner';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

const ENCODING_TOAST_ID = 'encoding-error-toast';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const t = useTranslations('ClientPage');

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/auth/signin');
    }
    const verifySession = async () => {
      try {
        await user?.getIdToken(true);
        setIsVerifying(false);
      } catch (error) {
        toast.error(t('errorSessionExpired') + (error as Error)?.message, {
          id: ENCODING_TOAST_ID,
        });
        await signOut();
        router.replace('/auth/signin');
      }
    };

    verifySession();
  }, [user, loading, router, signOut, t]);

  if (loading || isVerifying) {
    return <Spinner />;
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
