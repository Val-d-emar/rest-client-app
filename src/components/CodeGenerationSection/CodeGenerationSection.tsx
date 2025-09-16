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
        </div>
        <pre className={`response-viewer response-viewer-body mono ${classes['code-wrapper']}`}>
          <code>
            <button
              type='button'
              className={classes.button}
              onClick={handleCopy}
              disabled={!generatedCode}
            >
              <svg
                fill='currentColor'
                height='20px'
                width='20px'
                version='1.1'
                id='Layer_1'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                viewBox='0 0 460 460'
                xmlSpace='preserve'
              >
                <g>
                  <path
                    d='M425.934,0H171.662c-18.122,0-32.864,14.743-32.864,32.864v77.134h30V32.864c0-1.579,1.285-2.864,2.864-2.864h254.272
				c1.579,0,2.864,1.285,2.864,2.864v254.272c0,1.58-1.285,2.865-2.864,2.865h-74.729v30h74.729
				c18.121,0,32.864-14.743,32.864-32.865V32.864C458.797,14.743,444.055,0,425.934,0z'
                  />
                  <path
                    d='M288.339,139.998H34.068c-18.122,0-32.865,14.743-32.865,32.865v254.272C1.204,445.257,15.946,460,34.068,460h254.272
				c18.122,0,32.865-14.743,32.865-32.864V172.863C321.206,154.741,306.461,139.998,288.339,139.998z M288.341,430H34.068
				c-1.58,0-2.865-1.285-2.865-2.864V172.863c0-1.58,1.285-2.865,2.865-2.865h254.272c1.58,0,2.865,1.285,2.865,2.865v254.273h0.001
				C291.206,428.715,289.92,430,288.341,430z'
                  />
                </g>
              </svg>
            </button>
            {generatedCode || t('SelectLanguage')}
          </code>
        </pre>
      </div>
    </div>
  );
}
