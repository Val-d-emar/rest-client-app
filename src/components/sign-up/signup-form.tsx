'use client';

import React from 'react';
import '../sign-in/form.css';
import FormContent from '../sign-in/form-content';

type SubmitValues = {
  email: string;
  password: string;
};

const SignUpForm: React.FC = () => {
  const handleSignUp = async (userData: SubmitValues) => {
    try {
      // Здесь будет логика отправки данных на сервер для регистрации
      console.log('Registering user:', userData);

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
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className={'wrapper'}>
      <FormContent onSignUp={handleSignUp} />
    </div>
  );
};

export default SignUpForm;
