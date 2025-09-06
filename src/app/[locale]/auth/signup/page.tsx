import SignUpForm from '@/components/sign-up/signup-form';
import { useTranslations } from 'next-intl';

export default function SignUpPage() {
  const t = useTranslations('AuthForm');

  return (
    <div>
      <h1>{t('signUpTitle')}</h1>
      <SignUpForm />
    </div>
  );
}
