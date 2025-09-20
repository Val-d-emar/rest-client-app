'use client';

import React from 'react';
import './form.css';
import FormContent from './form-content';
import { useAuth } from '@/context/AuthContext';
import { dbg, err } from '@/log';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

type SubmitValues = {
  email: string;
  password: string;
};

const SignInForm: React.FC = () => {
  const { signIn } = useAuth();
  const t = useTranslations('AuthForm');

  const handleSignIn = async (userData: SubmitValues) => {
    const toastId = toast.loading(t('signingIn'));
    try {
      await signIn(userData.email, userData.password);
      toast.success(t('welcomeBack'), { id: toastId });
      dbg('Signing in user:', userData);
    } catch (error) {
      err('Sign in error:', error);
      const errorMessage = (error as Error)?.message;

      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  return (
    <div className={'wrapper'}>
      <FormContent onSignIn={handleSignIn} />
    </div>
  );
};

export default SignInForm;
