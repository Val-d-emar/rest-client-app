'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import classes from './RequestBody.module.css';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

type BodyType = 'json' | 'text';

export type Props = {
  body: string;
  setBody?: Dispatch<SetStateAction<string>>;
  readonly: boolean;
  status?: number;
  statusText?: string;
};

export default function BodyPane({ body, setBody, readonly, status, statusText }: Props) {
  const t = useTranslations('ClientPage.requestBody');

  const [bodyType, setBodyType] = useState<BodyType>('json');

  const getStatusClass = (status?: number) => {
    if (status === undefined) return classes['status-neutral'];
    if (status < 200) return classes['status-neutral'];
    if (status < 300) return classes['status-ok'];
    if (status < 400) return classes['status-neutral'];
    return classes['status-error'];
  };

  const statusClass = getStatusClass(status);

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
            name='bodyType'
            value={bodyType}
            className={classes.select}
            onChange={(e) => setBodyType(e.target.value as BodyType)}
            autoComplete='off'
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
        name='requestBody'
        placeholder={bodyType === 'json' ? t('JSONPlaceholder') : t('textPlaceholder')}
        value={body}
        onChange={(e) => {
          if (!readonly && setBody) {
            setBody(e.target.value);
          }
        }}
        className='mono'
        autoComplete='off'
      />
    </div>
  );
}
