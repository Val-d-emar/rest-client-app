'use client';

import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Toaster
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
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
