import { useTranslations } from 'next-intl';
import classes from './RequestBar.module.css';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
export type HttpMethods = (typeof METHODS)[number];

export default function RequestBar() {
  const t = useTranslations('ClientPage.requestBar');
  return (
    <div className={classes.wrapper}>
      <select>
        {METHODS.map((method, index) => (
          <option key={index}>{method}</option>
        ))}
      </select>
      <input placeholder={t('placeholder')} className={classes.input} />
      <button>{t('sendButton')}</button>
    </div>
  );
}
