import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@reown/appkit',
    '@reown/appkit-adapter-wagmi',
    'wagmi',
    'viem',
    '@wagmi/connectors'
  ],
  webpack: (config) => {
    // 1. Ignore the Safe SDK completely to stop the import.meta error
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /@safe-global/
      })
    );

    // 2. Setup fallbacks for other web3 modules
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false, net: false, tls: false, encoding: false, 
      "porto/internal": false, "porto": false, "@gemini-wallet/core": false 
    };

    return config;
  },
};

export default nextConfig;