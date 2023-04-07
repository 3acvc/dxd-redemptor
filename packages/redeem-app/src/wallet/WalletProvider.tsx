import { PropsWithChildren } from "react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { chains } from "./chains";
import { providers } from "./providers";

const { provider } = configureChains(chains, providers);

// Set up client
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "DXdao Redeem App",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        chainId: 1,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
});

// Export the wagmi client to the window in development
if (process.env.NODE_ENV === "development") {
  (window as any).wagmiClient = wagmiClient;
}

/**
 * WalletProvider
 * @param param0
 * @returns
 */
export function WalletProvider({ children }: PropsWithChildren) {
  return <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>;
}
