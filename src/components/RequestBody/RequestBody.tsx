'use client';

import { Dispatch, SetStateAction } from 'react';
import BodyPane from './BodyPane';
import { useTranslations } from 'next-intl';

type Props = {
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
};

export default function RequestBody({ body, setBody }: Props) {
  const t = useTranslations('ClientPage.requestBody');
  return (
    <>
      <h3>{t('title')}</h3>
      <BodyPane body={body} setBody={setBody} readonly={false} />
    </>
  );
}
