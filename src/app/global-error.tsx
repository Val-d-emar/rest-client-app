'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className='centered-container'>
          <h2>Something went wrong!</h2>
          <p>An unexpected error occurred. Please try to reload the page.</p>
          <button onClick={() => reset()} className='error-button'>
            Reload the page
          </button>
        </div>
      </body>
    </html>
  );
}
