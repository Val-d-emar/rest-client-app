import { err, log, warn } from '@/log';

export default function Home() {
  log('test logging');
  err('test error');
  warn('test warning');

  return (
    <main>
      <h1>REST Client App</h1>
    </main>
  );
}
