'use client';

import React, { useState } from 'react';
import '../sign-in/form.css';
import FormContent from '../sign-in/form-content';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { dbg } from '@/log';

type SubmitValues = {
  email: string;
  password: string;
};

const SignUpForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();
  const handleSignUp = async (userData: SubmitValues) => {
    setError(null);
    try {
      await signUp(userData.email, userData.password);
      // Здесь будет логика отправки данных на сервер для регистрации
      dbg('Registering user:', userData);
      router.push('/');
      // удалить Пример API запроса (пока что заглушка)
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Registration failed');
      // }
      //
      // const result = await response.json();
      // console.log('Registration successful:', result);

      // удалить заглушка
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Registration successful! Welcome, ${userData.email}!`);
    } catch (error) {
      // console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
      // TODO: Преобразовывать коды ошибок Firebase в человеко-понятные сообщения
      setError((error as Error)?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={'wrapper'}>
      {/* <FormContent onSignUp={handleSignUp} /> */}
      <FormContent onSignUp={handleSignUp} error={error} setError={setError} />
    </div>
  );
};

export default SignUpForm;
