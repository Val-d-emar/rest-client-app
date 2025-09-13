declare module 'postman-collection';
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
    indentType?: string;
    trimRequestBody?: boolean;
    followRedirect?: boolean;
    requestTimeout?: number;
    ES6_enabled?: boolean;
  }

  export interface PostmanRequest {
    method: string;
    url: string;
    header: { key: string; value: string }[];
    body:
      | {
          mode: 'raw';
          raw: string;
        }
      | undefined;
  }

  export function getLanguageList(): Language[];

  type Callback = (error: Error | null, snippet: string) => void;

  export function convert(
    lang: string,
    variant: string,
    request: PostmanRequest,
    options: Options,
    callback: Callback,
  ): void;
}
