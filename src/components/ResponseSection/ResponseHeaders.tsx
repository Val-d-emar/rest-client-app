import React from 'react';
import classes from './ResponseHeaders.module.css';
import { useTranslations } from 'next-intl';

type Props = {
  headers: Record<string, string> | null;
};

export default function ResponseHeaders({ headers }: Props) {
  const t = useTranslations('ClientPage.response');
  const rows: [string, string][] = headers === null ? [] : Object.entries(headers);
  if (!rows.length) return <div>{t('responseEmptyHeaders')}</div>;

  return (
    <div className={classes.table}>
      {rows.map(([key, value], index) => (
        <div className={classes.row} key={index}>
          <div className={classes.key}>{key}</div>
          <div className={classes.value}>{value}</div>
        </div>
      ))}
    </div>
  );
}
