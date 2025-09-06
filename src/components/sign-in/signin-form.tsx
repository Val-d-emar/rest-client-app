'use client';

import React from 'react';
import './form.css';
import SignInContent from './signin-content';

const SignInForm: React.FC = () => {
  return (
    <div className={'wrapper'}>
      <SignInContent />
    </div>
  );
};

export default SignInForm;
