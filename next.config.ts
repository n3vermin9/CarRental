import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost', '172.20.10.3'],
};

export default nextConfig;
