'use client';

import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import type { Language } from 'postman-code-generators';
import classes from './CodeGenerationSection.module.css';

type Props = {
  languages: Language[];
  selectedLanguage: string;
  setSelectedLanguage: Dispatch<SetStateAction<string>>;
  generatedCode: string;
};

export default function CodeGenerationSection({
  languages,
  selectedLanguage,
  setSelectedLanguage,
  generatedCode,
}: Props) {
  const t = useTranslations('codeGenerator');

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success(t('codeCopied'));
    }
  };

  return (
    <div className={classes.wrapper}>
      <h3>{t('codeGenerationTitle')}</h3>
      <div className='card'>
        <div className={classes.controls}>
          <select
            name='language'
            id='language'
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languages.map((lang) =>
              lang.variants.map((variant) => (
                <option key={`${lang.key}-${variant.key}`} value={`${lang.key},${variant.key}`}>
                  {`${lang.label}${lang.key !== variant.key ? ` - ${variant.key}` : ''}`}
                </option>
              )),
            )}
          </select>
          <button onClick={handleCopy} disabled={!generatedCode}>
            {t('copyButton')}
          </button>
        </div>
        <pre className='response-viewer response-viewer-body'>
          <code>{generatedCode || t('SelectLanguage')}</code>
        </pre>
      </div>
    </div>
  );
}
