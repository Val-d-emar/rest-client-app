import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import styles from './footer.module.css';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  return (
    <div className={styles.footer}>
      <div className={styles.line}>
        <p className={`${styles.dev} bold `}>{t('developedBy')}</p>
        <Link
          href='https://github.com/Val-d-emar/rest-client-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          val-d-emar
        </Link>
        <Link href='https://github.com/olenaweb' target='_blank' rel='noopener noreferrer'>
          olenaweb
        </Link>
        <Link href='https://github.com/binary-apple' target='_blank' rel='noopener noreferrer'>
          binary-apple
        </Link>
      </div>
      <div className={styles.line2}>
        <p className={`${styles.school} bold `}>RS School</p>
        <Link
          className={styles.rss}
          href='https://rs.school/courses/reactjs'
          target='_blank'
          rel='noopener noreferrer'
        >
          <Image src='/rss-logo.svg' alt='rss-logo' width={30} height={30} />
        </Link>
        <p className={`${styles.year} bold `}>2025</p>
      </div>
    </div>
  );
}
