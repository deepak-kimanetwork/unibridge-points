import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, bsc } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '8e404b9e2894b92c45e5d36b8e404b9e';

export const networks = [mainnet, arbitrum, bsc];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'UniBridge Points',
    description: 'Bridge and Stake to earn rewards',
    url: 'https://unibridge-points.vercel.app',
    icons: ['https://unibridge.ai/logo.png']
  },
  features: {
    analytics: true,
    email: false, // Disabling these reduces the number of connectors loaded
    socials: false,
    swaps: false
  }
});