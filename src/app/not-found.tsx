import { Link } from '@/i18n/navigation';

export default function GlobalNotFound() {
  return (
    <html lang='en'>
      <body>
        <div className='centered-container'>
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Sorry, the page you are looking for does not exist.</p>
          <Link href='/'>
            <button type='button'>Return to Home</button>
          </Link>
        </div>
      </body>
    </html>
  );
}
