'use client';

import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { err, log } from '@/log';

type FormDataInput = {
  email: string;
  password: string;
  confirmPassword?: string;
};

type SubmitValues = Omit<FormDataInput, 'confirmPassword'>;

type PropsSign = {
  onSignIn?: (userData: SubmitValues) => Promise<void> | void;
  onSignUp?: (userData: SubmitValues) => Promise<void> | void;
  // error: string | null;
  // setError: (error: string | null) => void;
};

// const FormContent: React.FC<PropsSign> = ({ onSignIn, onSignUp, error, setError }) => {
const FormContent: React.FC<PropsSign> = ({ onSignIn, onSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations('AuthForm');

  const needsConfirmPassword = !!onSignUp;

  const schema = Yup.object().shape({
    email: Yup.string()
      .required(t('validation.emailRequired'))
      .email(t('validation.emailIncorrect'))
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, t('validation.emailIncorrect'))
      .test('email-domain', t('validation.emailIncorrect'), (value) => {
        if (!value) return false;
        const parts = value.split('@');
        if (parts.length !== 2) return false;
        const [localPart, domain] = parts;
        if (localPart.length === 0) return false;
        const domainParts = domain.split('.');
        if (domainParts.length < 2) return false;
        const tld = domainParts[domainParts.length - 1];
        return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
      }),
    password: Yup.string()
      .required(t('validation.passwordRequired'))
      .min(8, t('validation.passwordMinLength'))
      .matches(/[\p{Lu}]/u, t('validation.passwordUppercase'))
      .matches(/[\p{Ll}]/u, t('validation.passwordLowercase'))
      .matches(/\d/, t('validation.passwordDigit'))
      .matches(/[@#$!^%*?&_-]/, t('validation.passwordSpecial'))
      .test('unicode-format', t('validation.passwordUnicode'), (value) => {
        if (!value) return false;
        try {
          const encoded = encodeURIComponent(value);
          const decoded = decodeURIComponent(encoded);
          return decoded === value && value.length > 0;
        } catch {
          return false;
        }
      }),
    ...(needsConfirmPassword && {
      confirmPassword: Yup.string()
        .required(t('validation.confirmPasswordRequired'))
        .oneOf([Yup.ref('password')], t('validation.passwordsMatch')),
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
    trigger,
    watch,
  } = useForm<FormDataInput>({
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<FormDataInput>,
    defaultValues: {
      email: '',
      password: '',
      ...(needsConfirmPassword && { confirmPassword: '' }),
    },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  useEffect(() => {
    if (needsConfirmPassword && passwordValue) {
      trigger('password');
    }
  }, [passwordValue, needsConfirmPassword, trigger]);

  useEffect(() => {
    if (needsConfirmPassword && confirmPasswordValue && passwordValue) {
      trigger('confirmPassword');
    }
  }, [passwordValue, needsConfirmPassword, trigger, confirmPasswordValue]);

  useEffect(() => {
    if (needsConfirmPassword && confirmPasswordValue && confirmPasswordValue.length > 0) {
      trigger('confirmPassword');
    }
  }, [confirmPasswordValue, needsConfirmPassword, trigger]);

  const onSubmit: SubmitHandler<FormDataInput> = async (data) => {
    try {
      // setError(null);
      const { email, password } = data;
      const userData: SubmitValues = {
        email,
        password,
      };

      if (onSignUp) {
        await onSignUp(userData);
        log('User registered:', userData.email);
      } else if (onSignIn) {
        await onSignIn(userData);
        log('User signed in:', userData.email);
      } else {
        log('No action function provided, userData:', userData);
      }

      reset();
    } catch (e) {
      err('Form submission error:', e);
    }
  };

  return (
    <form id='control' className='form' onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='input-block'>
        <label htmlFor='email'>
          <span style={{ color: 'red' }}>*</span> {t('email')}:
        </label>
        <input id='email' type='email' {...register('email')} tabIndex={1} />
        {errors.email && <p className='error'>{errors.email.message}</p>}
      </div>
      <div className='input-block'>
        <label htmlFor='password'>
          <span style={{ color: 'red' }}>*</span> {t('password')}:
        </label>
        <div className='password-input-wrapper'>
          <input
            id='password'
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              ...(needsConfirmPassword && {
                onBlur: () => {
                  trigger('password');
                },
              }),
            })}
            tabIndex={2}
          />
          <button
            type='button'
            className='password-toggle-btn'
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
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

      {needsConfirmPassword && (
        <div className='input-block'>
          <label htmlFor='confirm-password'>
            <span style={{ color: 'red' }}>*</span> {t('confirmPassword')}:
          </label>
          <div className='password-input-wrapper'>
            <input
              id='confirm-password'
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                onBlur: () => {
                  if (needsConfirmPassword) {
                    trigger('confirmPassword');
                  }
                },
              })}
              tabIndex={3}
            />
            <button
              type='button'
              className='password-toggle-btn'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? t('hideConfirmPassword') : t('showConfirmPassword')}
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
      )}

      <button
        className={'submit-btn'}
        type='submit'
        disabled={!isValid || isSubmitting}
        tabIndex={10}
      >
        {isSubmitting
          ? t('submitting')
          : onSignUp
            ? t('signUp')
            : onSignIn
              ? t('signIn')
              : t('submit')}
      </button>
    </form>
  );
};
export default FormContent;
