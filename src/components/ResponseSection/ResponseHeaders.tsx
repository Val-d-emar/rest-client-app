import React from 'react';
import classes from './ResponseHeaders.module.css';

type Props = {
  headers: Record<string, string> | null;
};

export default function ResponseHeaders({ headers }: Props) {
  const rows: [string, string][] = headers === null ? [] : Object.entries(headers);
  if (!rows.length) return <div>No headers</div>;

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
