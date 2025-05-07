import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { dirs: ['src/components', 'src/pages', 'src/utils', 'src/types', 'src/app'] },
};

export default nextConfig;
