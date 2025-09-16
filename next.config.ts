import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA ||
      require('child_process').execSync('git rev-parse HEAD').toString().trim(),
    NEXT_PUBLIC_BUILD_TIMESTAMP: new Date().toUTCString(),
  },
  compiler: {
    removeConsole: false,
  },
  turbopack: {
    root: __dirname,
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
