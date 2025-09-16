'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import classes from './RequestBody.module.css';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

type BodyType = 'json' | 'text';

type Props = {
  body: string;
  setBody?: Dispatch<SetStateAction<string>>;
  readonly: boolean;
  status?: number;
  statusText?: string;
};

export default function BodyPane({ body, setBody, readonly, status, statusText }: Props) {
  const t = useTranslations('ClientPage.requestBody');

  const [bodyType, setBodyType] = useState<BodyType>('json');

  const statusClass =
    status == null
      ? classes['status-neutral']
      : status < 200
        ? classes['status-neutral']
        : status < 300
          ? classes['status-ok']
          : status < 400
            ? classes['status-neutral']
            : classes['status-error'];

  return (
    <div className={classes.container}>
      {readonly ? (
        <div className={`${statusClass} ${classes.status}`}>
          {status} {statusText}
        </div>
      ) : (
        <div className={classes.controls}>
          <select
            aria-label='Body mode'
            value={bodyType}
            className={classes.select}
            onChange={(e) => setBodyType(e.target.value as BodyType)}
          >
            <option value='json'>JSON</option>
            <option value='text'>Text</option>
          </select>
          {bodyType === 'json' && (
            <button
              onClick={() => {
                try {
                  const pretty = JSON.stringify(JSON.parse(body), null, 2);
                  if (setBody) {
                    setBody(pretty);
                  }
                } catch {
                  toast.error(t('prettifyError'));
                }
              }}
            >
              {t('prettifyButton')}
            </button>
          )}
        </div>
      )}

      <textarea
        aria-label='Request body editor'
        placeholder={bodyType === 'json' ? t('JSONPlaceholder') : t('textPlaceholder')}
        value={body}
        onChange={(e) => {
          if (!readonly && setBody) {
            setBody(e.target.value);
          }
        }}
        className='mono'
      />
    </div>
  );
}
