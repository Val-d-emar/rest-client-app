import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import styles from './footer.module.css';
// import "@/app/index.css";

export default function Footer() {
  return (
    <div className={styles.footer}>
      <Link
        href='https://github.com/Val-d-emar/rest-client-app'
        target='_blank'
        rel='noopener noreferrer'
      >
        GitHub
      </Link>
      <p className='bold year'>2025</p>
      <Link
        className='rss'
        href='https://rs.school/courses/reactjs'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Image src='/rss-logo.svg' alt='description' width={30} height={30} />
      </Link>
    </div>
  );
}
