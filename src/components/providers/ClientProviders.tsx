'use client';

import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';
import { dbg } from '@/log';

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  const toastDuration = Number(process.env.NEXT_PUBLIC_TOAST_DURATION) || 5000;
  dbg('toastDuration=', toastDuration);
  return (
    <>
      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          duration: toastDuration,
          style: {
            background: 'var(--color)',
            color: 'var(--white-color)',
          },
        }}
      />
      {children}
    </>
  );
};
