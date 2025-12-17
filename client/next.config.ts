import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for Docker deployment
  output: 'standalone',
  
  // Disable telemetry for production
  typescript: {
    ignoreBuildErrors: false, // Keep type checking enabled
  },

  // Enable SWC minification for better performance
  // swcMinify: true,

  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7265',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
        pathname: '/**',
      },
      // Add this if you need to support any domain
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      }
    ],
    // Optional: Add image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },

  // Enable compression for better performance
  compress: true,

  // Customize webpack configuration
  webpack: (config, { dev }) => {
    // Handle media files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: 'static/media/',
            publicPath: '/_next/static/media/',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });

    // Optional: Add SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimize production builds
    if (!dev) {
      // Enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
      };
    }

    return config;
  },

  // Enable React strict mode for better development
  reactStrictMode: true,

  // Configure powered by header
  poweredByHeader: false,

  // Configure environment variables loading
  env: {
    // Add your public environment variables here
  },

  // Optional: Add custom headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
    ];
  },

  // Optional: Configure rewrites/redirects if needed
  async rewrites() {
    return [];
  },
};

export default nextConfig;// Security headers configured
// Image optimization configured
// Cleaned unused webpack rules
