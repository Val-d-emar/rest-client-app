declare module 'postman-code-generators' {
  export interface Variant {
    key: string;
    label: string;
  }

  export interface Language {
    key: string;
    label: string;
    syntax_mode: string;
    variants: Variant[];
  }

  export interface Options {
    indentCount?: number;
    indentType?: 'Space' | 'Tab';
    trimRequestBody?: boolean;
    followRedirect?: boolean;
  }

  export interface PostmanRequest {
    method: string;
    url: string;
    header: { key: string; value: string }[];
    body: {
      mode: 'raw';
      raw: string;
    };
  }

  type Callback<T> = (error: Error | null, result: T) => void;

  export function getLanguageList(): Language[];
  export function convert(
    lang: string,
    variant: string,
    request: PostmanRequest,
    options: Options,
    callback: Callback<string>,
  ): void;
}
