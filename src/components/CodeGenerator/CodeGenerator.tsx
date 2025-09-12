'use client';

import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';

type Language = { key: string; label: string; variant: string };

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
    navigator.clipboard.writeText(generatedCode);
    toast.success(t('codeCopied'));
  };

  return (
    <div>
      <h3>{t('codeGenerationTitle')}</h3>
      <div className='card'>
        <div>
          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
            {languages.map((lang) => (
              <option key={`${lang.key}-${lang.variant}`} value={`${lang.key},${lang.variant}`}>
                {lang.label} - {lang.variant}
              </option>
            ))}
          </select>
          <button onClick={handleCopy} disabled={!generatedCode}>
            {t('copyButton')}
          </button>
        </div>
        <pre className='response-viewer response-viewer-body'>
          <code>{generatedCode}</code>
        </pre>
      </div>
    </div>
  );
}
