'use client';

import { HttpRequestLog } from '@/type/type';

interface HistoryTableProps {
  logs: HttpRequestLog[];
}

export default function HistoryTable({ logs }: HistoryTableProps) {
  return (
    <div className='data-table-container'>
      <table className='data-table'>
        <thead>
          <tr>
            <th>Метод</th>
            <th>URL</th>
            <th>Статус</th>
            <th>Время (ms)</th>
            <th>Дата</th>
            <th>Размер запроса (b)</th>
            <th>Размер ответа (b)</th>
            <th>Ошибка</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className='body-line'>
              <td>{log.method}</td>
              <td>{log.url}</td>
              <td>{log.statusCode}</td>
              <td>{log.latency}</td>
              <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</td>
              <td>{log.requestSize}</td>
              <td>{log.responseSize}</td>
              <td>{log.errorDetails}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
