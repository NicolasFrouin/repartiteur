import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: [
      'src/actions',
      'src/app',
      'src/components',
      'src/lib',
      'src/prisma',
      'src/types',
      'src/utils',
    ],
  },
  typescript: { ignoreBuildErrors: process.env.IGNORE_TS_BUILD_ERRORS === 'true' },
};

export default nextConfig;
