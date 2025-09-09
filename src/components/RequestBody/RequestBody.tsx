'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import BodyPane from './BodyPane';

type Props = {
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
};

export default function RequestBody({ body, setBody }: Props) {
  const [value, setValue] = useState('');
  return (
    <>
      <h3>Request body</h3>
      <BodyPane body={body} setBody={setBody} readonly={false} />
    </>
  );
}
