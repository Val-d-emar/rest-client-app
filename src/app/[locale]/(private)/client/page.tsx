'use client';

import { Suspense, lazy } from 'react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import Spinner from '@/components/Spinner/Spinner';

const ClientPage = lazy(() => import('@/components/ClientPage/ClientPage'));

export default function ClientRoute() {
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  if (!user) {
    redirect({ href: '/', locale });
    return null;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ClientPage />
    </Suspense>
  );
}
