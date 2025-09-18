'use server';

import { err } from '@/log';
import codeGenerator from 'postman-code-generators';
import type { Language, PostmanRequest, Options } from 'postman-code-generators';
import { Request as PostmanRequestSDK } from 'postman-collection';
import { cache } from 'react';

export const getAvailableLanguages = cache(async (): Promise<Language[]> => {
  try {
    const languages: Language[] = codeGenerator.getLanguageList();
    return languages;
  } catch (error) {
    err('[SERVER ACTION] Error in getAvailableLanguages:', error);
    throw new Error('Failed to get language list.');
  }
});

export async function generateCodeSnippet(
  requestData: PostmanRequest,
  langKey: string,
  langVariant: string,
): Promise<string> {
  const postmanRequest = new PostmanRequestSDK(requestData);

  const options: Options = {
    indentCount: 2,
    indentType: 'Space',
    requestTimeout: 0,
    followRedirect: true,
    trimRequestBody: true,
    ES6_enabled: false,
  };

  return new Promise((resolve, reject) => {
    codeGenerator.convert(
      langKey,
      langVariant,
      postmanRequest,
      options,
      (error: Error | null, snippet: string) => {
        if (error) {
          err('[SERVER ACTION] Error in generateCodeSnippet:', error);
          return reject(error);
        }
        resolve(snippet);
      },
    );
  });
}
