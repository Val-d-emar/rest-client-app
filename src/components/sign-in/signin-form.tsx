'use client';

import React, { useState } from 'react';
import './form.css';
import FormContent from './form-content';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import { err, log } from '@/log';

type SubmitValues = {
  email: string;
  password: string;
};

const SignInForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async (userData: SubmitValues) => {
    try {
      await signIn(userData.email, userData.password);
      log('Signing in user:', userData);

      // удалить Пример API запроса
      // const response = await fetch('/api/auth/signin', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Sign in failed');
      // }
      //
      // const result = await response.json();
      // console.log('Sign in successful:', result);

      // удалить
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Welcome back, ${userData.email}!`);
    } catch (error) {
      err('Sign in error:', error);
      alert('Sign in failed. Please try again.');
      // TODO: Преобразовывать коды ошибок Firebase в человеко-понятные сообщения
      setError((error as Error)?.message || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className={'wrapper'}>
      <FormContent onSignIn={handleSignIn} error={error} setError={setError} />
    </div>
  );
};

export default SignInForm;
