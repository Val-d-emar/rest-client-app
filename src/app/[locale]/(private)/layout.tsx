'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner/Spinner';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spinner />;
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
