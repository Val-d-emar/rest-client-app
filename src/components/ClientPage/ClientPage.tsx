import RequestBar from '@/components/RequestBar';
import RequestHeaders from '@/components/RequestHeaders';
import classes from './ClientPage.module.css';
import { useTranslations } from 'next-intl';

export default function ClientPage() {
  const t = useTranslations('ClientPage');
  return (
    <div className={classes.wrapper}>
      <h1>{t('title')}</h1>
      <div className={classes['request-wrapper']}>
        <section className={classes.panel}>
          <RequestBar />
          <RequestHeaders />
        </section>
        <div className={classes.divider}></div>
        <section className={classes.panel}>TODO: response section</section>
      </div>
    </div>
  );
}
