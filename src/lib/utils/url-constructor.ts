import { HttpMethods } from '@/type';

const safeBtoa = (str: string): string => btoa(encodeURIComponent(str));

type UrlConstructorParams = {
  method: HttpMethods;
  url: string;
  body?: string | null;
  headers?: Record<string, string> | null;
};

export const constructClientUrl = (params: UrlConstructorParams): string => {
  const { method, url, body, headers } = params;

  const searchParams = new URLSearchParams();

  searchParams.set('method', method);
  if (url) searchParams.set('url', safeBtoa(url));
  if (body) searchParams.set('body', safeBtoa(body));

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  return `/client?${searchParams.toString()}`;
};
