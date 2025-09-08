'use client';

import { useState } from 'react';
import classes from './RequestBody.module.css';

type BodyType = 'json' | 'text';

type Props = {
  readOnly?: boolean;
};

export default function RequestBody({ readOnly = false }: Props) {
  const [value, setValue] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>('json');
  return (
    <>
      <h3>Request body</h3>
      <div className={classes.container}>
        {!readOnly && (
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
                    const pretty = JSON.stringify(JSON.parse(value), null, 2);
                    setValue(pretty);
                  } catch {
                    // TODO: add error handler
                  }
                }}
              >
                Prettify
              </button>
            )}
          </div>
        )}

        {readOnly ? (
          <pre className={classes.mono}>{value}</pre>
        ) : (
          <textarea
            aria-label='Request body editor'
            placeholder={bodyType === 'json' ? 'JSON' : 'Plain text'}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            className={classes.mono}
          />
        )}
      </div>
    </>
  );
}
