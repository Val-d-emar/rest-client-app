'use client';
import RequestBar from '@/components/RequestBar';
import RequestHeaders from '@/components/RequestHeaders';
import classes from './ClientPage.module.css';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HttpMethods } from '../RequestBar/RequestBar';
import { HeaderItem } from '../RequestHeaders/RequestHeaders';
import { forwardRequest, ServerResponse } from '@/lib/actions/request';
import { v4 as uuidv4 } from 'uuid';
import ResponseSection from '../ResponseSection/ResponseSection';

const initialHeaders: HeaderItem[] = [
  { id: uuidv4(), enabled: true, key: 'Content-Type', value: 'application/json' },
];

export default function ClientPage() {
  const t = useTranslations('ClientPage');
  const [method, setMethod] = useState<HttpMethods>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<HeaderItem[]>(initialHeaders);
  const [response, setResponse] = useState<ServerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);

    const requestHeaders = headers.reduce(
      (acc, header) => {
        if (header.enabled && header.key) {
          acc[header.key] = header.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    const result = await forwardRequest({
      url,
      method,
      headers: requestHeaders,
      // TODO: Добавить body в будущем
    });

    setResponse(result);
    setLoading(false);
  };
  return (
    <div className={classes.wrapper}>
      <h1>{t('title')}</h1>
      <div className={classes['request-wrapper']}>
        <section className={classes.panel}>
          <RequestBar
            method={method}
            setMethod={setMethod}
            url={url}
            setUrl={setUrl}
            onSend={handleSendRequest}
            loading={loading}
          />
          <RequestHeaders headers={headers} setHeaders={setHeaders} />
        </section>
        <div className={classes.divider}></div>
        <section className={classes.panel}>
          <ResponseSection response={response} loading={loading} />
        </section>
      </div>
    </div>
  );
}
