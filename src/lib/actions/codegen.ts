'use server';

import codeGenerator from 'postman-code-generators';
import type { Language, PostmanRequest, Options } from 'postman-code-generators';

export async function getAvailableLanguages(): Promise<Language[]> {
  try {
    const languages: Language[] = codeGenerator.getLanguageList();
    return languages;
  } catch (error) {
    console.error('[SERVER ACTION] Error in getAvailableLanguages:', error);
    throw new Error('Failed to get language list.');
  }
}

export async function generateCodeSnippet(
  requestData: PostmanRequest,
  langKey: string,
  langVariant: string,
): Promise<string> {
  const options: Options = {
    indentCount: 2,
    indentType: 'Space',
    trimRequestBody: true,
    followRedirect: true,
  };

  return new Promise((resolve, reject) => {
    codeGenerator.convert(
      langKey,
      langVariant,
      requestData,
      options,
      (error: Error | null, snippet: string) => {
        if (error) {
          return reject(error);
        }
        resolve(snippet);
      },
    );
  });
}
