'use client';

import React, { useState } from 'react';
import './form.css';
import FormContent from './form-content';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import { dbg, err, log } from '@/log';
import toast from 'react-hot-toast';

type SubmitValues = {
  email: string;
  password: string;
};

const SignInForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async (userData: SubmitValues) => {
    const toastId = toast.loading('Signing In...');
    try {
      await signIn(userData.email, userData.password);
      toast.success('Welcome back!', { id: toastId });
      dbg('Signing in user:', userData);
    } catch (error) {
      err('Sign in error:', error);
      // TODO: Преобразовывать коды ошибок Firebase в человеко-понятные сообщения
      const errorMessage = (error as Error)?.message || 'Sign in failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  return (
    <div className={'wrapper'}>
      <FormContent onSignIn={handleSignIn} error={error} setError={setError} />
    </div>
  );
};

export default SignInForm;
