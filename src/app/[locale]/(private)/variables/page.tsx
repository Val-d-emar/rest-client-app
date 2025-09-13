'use client';

import { Suspense, lazy } from 'react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import Spinner from '@/components/Spinner/Spinner';

const VariablesPage = lazy(() => import('@/components/variables/variables-page'));

export default function VariablesRoute() {
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  if (!user) {
    redirect({ href: '/signin', locale });
    return null;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <VariablesPage />
    </Suspense>
  );
}
