'use client';
import RequestBar from '@/components/RequestBar';
import RequestHeaders from '@/components/RequestHeaders';
import classes from './ClientPage.module.css';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { HttpMethods } from '../RequestBar/RequestBar';
import { HeaderItem } from '../RequestHeaders/RequestHeaders';
import { forwardRequest, ServerResponse } from '@/lib/actions/request';
import { v4 as uuidv4 } from 'uuid';
import ResponseSection from '../ResponseSection/ResponseSection';
import RequestBody from '../RequestBody/RequestBody';
import { err } from '@/log';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const safeAtob = (str: string | null): string => {
  if (!str) return '';
  try {
    return atob(str);
  } catch (e) {
    console.error('Failed to decode base64 string:', e);
    return '';
  }
};

const getInitialState = (searchParams: URLSearchParams) => {
  const method = (searchParams.get('method') as HttpMethods) || 'GET';
  const url = safeAtob(searchParams.get('url'));
  const body = safeAtob(searchParams.get('body'));

  const headers: HeaderItem[] = [];
  searchParams.forEach((value, key) => {
    if (!['method', 'url', 'body'].includes(key)) {
      headers.push({ id: uuidv4(), enabled: true, key, value });
    }
  });

  if (headers.length === 0) {
    headers.push({ id: uuidv4(), enabled: true, key: 'Content-Type', value: 'application/json' });
  }

  return {
    method,
    url: url || 'https://jsonplaceholder.typicode.com/posts/1',
    body,
    headers,
  };
};

export default function ClientPage() {
  const t = useTranslations('ClientPage');

  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isInitialLoad = useRef(true);

  const [initialState] = useState(() => getInitialState(searchParams));
  const [method, setMethod] = useState<HttpMethods>(initialState.method);
  const [url, setUrl] = useState(initialState.url);
  const [body, setBody] = useState(initialState.body);
  const [headers, setHeaders] = useState<HeaderItem[]>(initialState.headers);

  const [response, setResponse] = useState<ServerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const newSearchParams = new URLSearchParams();

    newSearchParams.set('method', method);
    if (url) newSearchParams.set('url', btoa(url));
    if (body) newSearchParams.set('body', btoa(body));

    headers.forEach((h) => {
      if (h.enabled && h.key) {
        newSearchParams.set(h.key, h.value);
      }
    });

    router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  }, [method, url, body, headers, router, pathname]);

  const handleSendRequest = async () => {
    if (!user) return toast.error('You must be logged in.');
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
      userId: user.uid,
      url,
      method,
      headers: requestHeaders,
      body,
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
          <RequestBody body={body} setBody={setBody} />
        </section>
        <div className={classes.divider}></div>
        <section className={classes.panel}>
          <ResponseSection response={response} loading={loading} />
        </section>
      </div>
    </div>
  );
}
