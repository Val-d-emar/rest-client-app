'use client';

import React, { useState } from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';

type FormDataInput = {
  email: string;
  password: string;
  confirmPassword: string;
};
type SubmitValues = Omit<FormDataInput, 'confirmPassword'>;

const SignInContent: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = Yup.object({
    email: Yup.string().email('Incorrect email').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'At least 8 characters')
      .matches(/[\p{Lu}]/u, 'Need at least one uppercase letter')
      .matches(/[\p{Ll}]/u, 'Need at least one lowercase letter')
      .matches(/\d/, 'Need at least one digit')
      .matches(/[@#$!^%*?&_-]/, 'Need special character @#$!^%*?&_-')
      .test('unicode-format', 'Password must be in valid Unicode format', (value) => {
        if (!value) return false;
        try {
          const encoded = encodeURIComponent(value);
          const decoded = decodeURIComponent(encoded);
          return decoded === value && value.length > 0;
        } catch {
          return false;
        }
      }),
    confirmPassword: Yup.string()
      .required('Is required')
      .oneOf([Yup.ref('password')], "Passwords don't match"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<FormDataInput>({
    mode: 'onTouched',
    resolver: yupResolver(schema) as Resolver<FormDataInput>,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<FormDataInput> = async (data) => {
    try {
      const { email, password } = data;
      const userData: SubmitValues = {
        email,
        password,
      };
      console.log('"userData="', userData);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form id='control' className='form' onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='input-block'>
        <label htmlFor='email'>Email:</label>
        <input id='email' type='email' {...register('email')} tabIndex={1} autoFocus />
        {errors.email && <p className='error'>{errors.email.message}</p>}
      </div>
      <div className='input-block'>
        <label htmlFor='password'>Password:</label>
        <div className='password-input-wrapper'>
          <input
            id='password'
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            tabIndex={2}
          />
          <button
            type='button'
            className='password-toggle-btn'
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.45703 12C3.73128 7.94288 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M11.9992 15C13.6561 15 14.9992 13.6569 14.9992 12C14.9992 10.3431 13.6561 9 11.9992 9C10.3424 9 8.99923 10.3431 8.99923 12C8.99923 13.6569 10.3424 15 11.9992 15Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && <p className='error'>{errors.password.message}</p>}
      </div>

      <div className='input-block'>
        <label htmlFor='confirm-password'>Confirm Password:</label>
        <div className='password-input-wrapper'>
          <input
            id='confirm-password'
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            tabIndex={3}
          />
          <button
            type='button'
            className='password-toggle-btn'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.45703 12C3.73128 7.94288 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M11.9992 15C13.6561 15 14.9992 13.6569 14.9992 12C14.9992 10.3431 13.6561 9 11.9992 9C10.3424 9 8.99923 10.3431 8.99923 12C8.99923 13.6569 10.3424 15 11.9992 15Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className='error'>{errors.confirmPassword.message}</p>}
      </div>

      <button
        className={'submit-btn'}
        type='submit'
        disabled={!isValid || isSubmitting}
        tabIndex={10}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
export default SignInContent;
