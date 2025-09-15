'use client';

import React, { useState } from 'react';
import '../sign-in/form.css';
import FormContent from '../sign-in/form-content';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { dbg } from '@/log';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

type SubmitValues = {
  email: string;
  password: string;
};

const SignUpForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();
  const t = useTranslations('AuthForm');
  const handleSignUp = async (userData: SubmitValues) => {
    // setError(null);
    const toastId = toast.loading(t('registering'));
    try {
      await signUp(userData.email, userData.password);
      dbg('Registering user:', userData);
      toast.success(t('registrationSuccess'), {
        id: toastId,
      });
      router.push('/');
    } catch (error) {
      const errorMessage = (error as Error)?.message || t('registrationFailed');
      // setError(errorMessage);
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  return (
    <div className={'wrapper'}>
      {/* <FormContent onSignUp={handleSignUp} error={error} setError={setError} /> */}
      <FormContent onSignUp={handleSignUp} />
    </div>
  );
};

export default SignUpForm;
