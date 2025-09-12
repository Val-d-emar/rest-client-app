'use client';

import Image from 'next/image';
import { useState } from 'react';
import { handleAddLog, testLogData } from '@/lib/client-action';
import { handleGetLogUser } from '@/lib/client-action/handle-getlog-user';
import { HttpRequestLog } from '@/type/type';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<HttpRequestLog[]>([]);

  // Функция для записи лога через модуль handle-add-log
  const handleRecordLogWithLoading = async () => {
    setIsLoading(true);
    try {
      await handleAddLog(testLogData, t);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для получения логов через модуль handle-getlog-user
  const handleGetLogs = async () => {
    try {
      const result = await handleGetLogUser();

      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error('Ошибка в handleGetLogs:', error);
    }
  };

  return (
    <div className='container'>
      <header>
        <h1>H1 REST Client App</h1>
        <h1>H1 Клиент App</h1>
      </header>
      <main>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleRecordLogWithLoading} disabled={isLoading}>
            {isLoading ? 'Recording...' : 'Record Log'}
          </button>
          <span style={{ margin: '0 10px' }}></span>
          <button onClick={handleGetLogs}>Получить логи ({logs.length})</button>
        </div>

        {logs.length > 0 && (
          <div
            style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            <h4>Мои логи ({logs.length}):</h4>
            {logs.slice(0, 3).map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '5px',
                  fontSize: '12px',
                  padding: '5px',
                  backgroundColor: 'white',
                  borderRadius: '2px',
                }}
              >
                <strong>
                  {log.method} {log.url}
                </strong>{' '}
                - Status: {log.statusCode} -{log.latency}ms -{log.timestamp?.toLocaleString()}
              </div>
            ))}
            {logs.length > 3 && (
              <p style={{ fontSize: '12px', color: '#666' }}>И еще {logs.length - 3} записей...</p>
            )}
          </div>
        )}

        <br />
        <h2>H2 Client for working with REST API</h2>
        <h2>H2 Клиент для работы с REST API</h2>
        <br />
        <button>Click me</button>
        <br />
        <a href='http://example.com'>Link</a>
        <a href='http://example.com'>Link2</a>
        <input type='text' placeholder='Enter text' />
        <br />
        <select>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
        <br />

        <div className='image-container'>
          <Image
            src='/back-picture.jpg'
            alt='description'
            width={500}
            height={300}
            className='image'
          />
        </div>
        <p>This is an example paragraph.</p>
        <p>Это пример параграфа</p>
        <p className='error'>This is an example Error.</p>
        <div className='card'>
          <h3>H3 Card Title</h3>
          <h3>H3 Название карточки</h3>
          <p>Card content. Box-shadow и скругление.</p>
        </div>
        <div className='modal'>
          <h3>Modal Title</h3>
          <p>Modal content. Box-shadow и скругление.</p>
        </div>
        <button disabled>Disabled Button</button>
      </main>
      <footer>
        <p>Footer content goes here.</p>
      </footer>
    </div>
  );
}
