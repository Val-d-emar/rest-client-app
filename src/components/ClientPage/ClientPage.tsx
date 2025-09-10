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
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { dbg } from '@/log';
import { getStoredVariables, substituteVariables } from '@/lib/utils/variables';

const ENCODING_TOAST_ID = 'encoding-error-toast';

const safeAtob = (str: string | null): string => {
  if (!str) return '';
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    toast.error('Failed to decode base64 string: ' + (e as Error)?.message, {
      id: ENCODING_TOAST_ID,
    });
    return '';
  }
};

const safeBtoa = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (e) {
    toast.error('Failed to encode to base64: ' + (e as Error)?.message, {
      id: ENCODING_TOAST_ID,
    });
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
    if (url) newSearchParams.set('url', safeBtoa(url));
    if (body) newSearchParams.set('body', safeBtoa(body));

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
    const TIMEOUT_DURATION = Number(process.env.NEXT_PUBLIC_FETCH_TIMEOUT_DURATION) || 15000;

    const variables = getStoredVariables();

    const processedUrl = substituteVariables(url, variables);
    const processedBody = substituteVariables(body, variables);

    const requestHeaders = headers.reduce(
      (acc, header) => {
        if (header.enabled && header.key) {
          acc[header.key] = substituteVariables(header.value, variables);
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    try {
      const timeoutPromise = new Promise<ServerResponse>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timed out after ${TIMEOUT_DURATION / 1000} seconds`)),
          TIMEOUT_DURATION,
        ),
      );

      const result = await Promise.race([
        forwardRequest({
          userId: user.uid,
          url: processedUrl,
          method,
          headers: requestHeaders,
          body: processedBody,
        }),
        timeoutPromise,
      ]);

      setResponse(result);
    } catch (error) {
      dbg('Client-side error calling Server Action:', error);

      const errorResponse: ServerResponse = {
        status: null,
        headers: null,
        body: null,
        error: (error as Error)?.message || 'An unknown client-side error occurred.',
        statusText: null,
      };
      setResponse(errorResponse);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
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
