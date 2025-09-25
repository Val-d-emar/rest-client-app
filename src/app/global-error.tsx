'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='centered-container'>
      <h2>Something went wrong!</h2>
      <p>An unexpected error occurred. Please try to reload the page.</p>
      <p>{error.message}</p>
      <button
        onClick={() => {
          window.location.reload();
        }}
        className='error-button'
      >
        Reload the page
      </button>
    </div>
  );
}
