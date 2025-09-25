'use client';
import { useTranslations } from 'next-intl';
import classes from './RequestBar.module.css';
import { Dispatch, SetStateAction } from 'react';
import { METHODS } from '@/constants';
import { HttpMethods } from '@/type';

type RequestBarProps = {
  method: HttpMethods;
  setMethod: Dispatch<SetStateAction<HttpMethods>>;
  url: string;
  setUrl: Dispatch<SetStateAction<string>>;
  onSend: () => void;
  loading: boolean;
};

export default function RequestBar({
  method,
  setMethod,
  url,
  setUrl,
  onSend,
  loading,
}: RequestBarProps) {
  const t = useTranslations('ClientPage.requestBar');
  return (
    <div className={classes.wrapper}>
      <select
        name='method'
        value={method}
        onChange={(e) => setMethod(e.target.value as HttpMethods)}
        autoComplete='off'
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        id='url-input'
        name='url'
        placeholder={t('placeholder')}
        className={classes.input}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        data-testid='url-input'
        autoComplete='off'
      />
      <button onClick={onSend} disabled={loading || !url}>
        {loading ? t('sendingButton') : t('sendButton')}
      </button>
    </div>
  );
}
