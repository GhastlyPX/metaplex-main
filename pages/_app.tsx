import '../styles/globals.css'
import type { AppProps } from 'next/app'
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {PhantomWalletAdapter, UnsafeBurnerWalletAdapter} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
      () => [
        new PhantomWalletAdapter({network}),
      ],
      []
  );






  return(
    <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
    <Component {...pageProps} />
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
                )
}

export default MyApp