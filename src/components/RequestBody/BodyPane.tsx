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
};

export default function BodyPane({ body, setBody, readonly }: Props) {
  const t = useTranslations('ClientPage.requestBody');

  const [bodyType, setBodyType] = useState<BodyType>('json');

  return (
    <div className={classes.container}>
      {!readonly && (
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
                  toast.error('Invalid JSON format');
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
          if (setBody) {
            setBody(e.target.value);
          }
        }}
        className={classes.mono}
      />
    </div>
  );
}
