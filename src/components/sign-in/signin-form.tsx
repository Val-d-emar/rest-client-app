'use client';

import React from 'react';
import './form.css';
import FormContent from './form-content';

type SubmitValues = {
  email: string;
  password: string;
};

const SignInForm: React.FC = () => {
  const handleSignIn = async (userData: SubmitValues) => {
    try {
      console.log('Signing in user:', userData);

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
      console.error('Sign in error:', error);
      alert('Sign in failed. Please try again.');
    }
  };

  return (
    <div className={'wrapper'}>
      <FormContent
        onSignIn={handleSignIn}
        error={null}
        setError={function (error: string | null): void {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};

export default SignInForm;
