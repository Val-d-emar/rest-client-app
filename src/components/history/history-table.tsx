'use client';

import { HttpMethods, HttpRequestLog } from '@/type/type';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { constructClientUrl } from '@/lib/utils/url-constructor';
import { METHODS } from '@/constants/constants';

interface HistoryTableProps {
  logs: HttpRequestLog[];
}

export default function HistoryTable({ logs }: HistoryTableProps) {
  const t = useTranslations('HistoryPage');
  function isHttpMethod(method: string): method is HttpMethods {
    return (METHODS as readonly string[]).includes(method.toUpperCase());
  }

  return (
    <div className='data-table-container'>
      <table className='data-table'>
        <thead>
          <tr>
            <th>{t('table.method')}</th>
            <th>{t('table.url')}</th>
            <th>{t('table.status')}</th>
            <th>{t('table.latency')}</th>
            <th>{t('table.timestamp')}</th>
            <th>{t('table.requestSize')}</th>
            <th>{t('table.responseSize')}</th>
            <th>{t('table.error')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            const clientUrl = constructClientUrl({
              method: (isHttpMethod(log.method) ? log.method.toUpperCase() : 'GET') as HttpMethods,
              url: log.url,
              body: log.requestBody,
              headers: log.headers,
            });

            return (
              <tr key={index} className='body-line history-row'>
                <td>
                  <Link href={clientUrl}>{log.method}</Link>
                </td>
                <td>
                  <Link href={clientUrl}>{log.url}</Link>
                </td>
                <td>
                  <Link href={clientUrl}>{log.statusCode}</Link>
                </td>
                <td>
                  <Link href={clientUrl}>{log.latency}</Link>
                </td>
                <td>
                  <Link href={clientUrl}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : t('noData')}
                  </Link>
                </td>
                <td>
                  <Link href={clientUrl}>{log.requestSize}</Link>
                </td>
                <td>
                  <Link href={clientUrl}>{log.responseSize}</Link>
                </td>
                <td>
                  <Link href={clientUrl}>{log.errorDetails}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
