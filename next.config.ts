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
  experimental: { serverActions: { allowedOrigins: ['*'] } },
};

export default nextConfig;
