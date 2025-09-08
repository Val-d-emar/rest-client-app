'use client';

import { v4 } from 'uuid';
import classes from './RequestHeaders.module.css';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslations } from 'next-intl';

export type HeaderItem = {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
};

type RequestHeadersProps = {
  headers: HeaderItem[];
  setHeaders: Dispatch<SetStateAction<HeaderItem[]>>;
};

// TODO: keep headers in context/Redux state
const HEADERS: HeaderItem[] = [
  {
    id: v4(),
    enabled: true,
    key: 'Accept',
    value: '*/*',
  },
  {
    id: v4(),
    enabled: false,
    key: 'Connection',
    value: 'keep-alive',
  },
];

const createEmptyHeader: () => HeaderItem = () => {
  return {
    id: v4(),
    enabled: true,
    key: '',
    value: '',
  };
};

// export default function RequestHeaders() {
export default function RequestHeaders({ headers, setHeaders }: RequestHeadersProps) {
  const t = useTranslations('ClientPage.requestHeaders');
  // const [headers, setHeaders] = useState([...HEADERS]);

  // const onAddClick = () => {
  //   HEADERS.push(createEmptyHeader());
  //   setHeaders([...HEADERS]);
  // };

  // const onRemove = (id: string) => {
  //   const index = HEADERS.findIndex((header) => header.id === id);
  //   if (index >= 0) {
  //     HEADERS.splice(index, 1);
  //     setHeaders([...HEADERS]);
  //   }
  // };

  // const onHeaderInputChange = (id: string, value: string, key: 'key' | 'value') => {
  //   const header = HEADERS.find((header) => header.id === id);
  //   if (!header) {
  //     return;
  //   }
  //   header[key] = value;
  //   setHeaders([...HEADERS]);
  // };

  // const onHeaderEnable = (id: string) => {
  //   const header = HEADERS.find((header) => header.id === id);
  //   if (!header || !header.key || !header.value) {
  //     return;
  //   }
  //   header.enabled = !header.enabled;
  //   setHeaders([...HEADERS]);
  // };

  const onAddClick = () => {
    setHeaders((currentHeaders) => [...currentHeaders, createEmptyHeader()]);
  };

  const onRemove = (id: string) => {
    setHeaders((currentHeaders) => currentHeaders.filter((header) => header.id !== id));
  };

  const onHeaderInputChange = (
    id: string,
    field: 'key' | 'value' | 'enabled',
    value: string | boolean,
  ) => {
    setHeaders((currentHeaders) =>
      currentHeaders.map((header) => (header.id === id ? { ...header, [field]: value } : header)),
    );
  };

  return (
    <>
      <h3>HTTP headers</h3>
      <div className={classes.table}>
        {headers.map((header) => (
          <div key={header.id} className={classes.row}>
            <div>
              <input
                type='checkbox'
                checked={header.enabled}
                className={classes.checkbox}
                onChange={(e) => onHeaderInputChange(header.id, 'enabled', e.target.checked)}
              />
            </div>
            <div>
              <input
                type='text'
                value={header.key}
                onChange={(e) => onHeaderInputChange(header.id, 'key', e.target.value)}
                placeholder={t('headerKeyPlaceholder')}
              />
            </div>
            <div>
              <input
                type='text'
                value={header.value}
                onChange={(e) => onHeaderInputChange(header.id, 'value', e.target.value)}
                placeholder={t('headerValuePlaceholder')}
              />
            </div>
            <div>
              <button type='button' className={classes.button} onClick={() => onRemove(header.id)}>
                <svg
                  width='20px'
                  height='20px'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <g clipPath='url(#clip0_429_11083)'>
                    <path
                      d='M7 7.00006L17 17.0001M7 17.0001L17 7.00006'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </g>
                  <defs>
                    <clipPath id='clip0_429_11083'>
                      <rect width='24' height='24' fill='white' />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
        ))}
        <div>
          <div>
            <button type='button' className={classes.button} onClick={onAddClick}>
              <svg
                width='20px'
                height='20px'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M6 12H18M12 6V18'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
