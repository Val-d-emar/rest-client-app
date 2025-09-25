import SignInForm from '@/components/sign-in/signin-form';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const t = useTranslations('AuthForm');

  return (
    <>
      <h1>{t('signInTitle')}</h1>
      <SignInForm />
    </>
  );
}
