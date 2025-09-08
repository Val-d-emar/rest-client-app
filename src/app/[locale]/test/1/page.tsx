'use client';

import { useState } from 'react';

import { forwardRequest, ServerResponse } from '@/lib/actions/request';

export default function ClientPage() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [response, setResponse] = useState<ServerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResponse(null);

    const result = await forwardRequest({
      url,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    setResponse(result);
    setLoading(false);
  };

  return (
    <div>
      <h1>SSR Page</h1>
      <form onSubmit={handleSubmit} className='card' style={{ marginTop: '2rem' }}>
        <div className='input-block'>
          <label htmlFor='url-input'>URL</label>
          <input id='url-input' type='text' value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <button type='submit' disabled={loading}>
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {response && (
        <div className='card'>
          <h2>Response</h2>
          {response.error ? (
            <p className='error'>{response.error}</p>
          ) : (
            <>
              <p>
                <span className='bold'>Status:</span> {response.status}
              </p>
              <h3>Headers:</h3>
              <pre>{JSON.stringify(response.headers, null, 2)}</pre>
              <h3>Body:</h3>
              <pre>{JSON.stringify(response.body, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
