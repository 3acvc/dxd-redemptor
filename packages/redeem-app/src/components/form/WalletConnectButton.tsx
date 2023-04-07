import { useIsNetworkSupported } from "hooks/useIsNetworkSupported";
import { ReactNode } from "react";
import { mainnet } from "wagmi/chains";
import { Modal, useModal } from "modal";
import { PrimaryButton } from "ui/components/Button";
import { useAccount, useSwitchNetwork } from "wagmi";

/**
 * A HOC to render children if the user is connected to the wallet and the network is supported.
 * Otherwise, it renders a button to connect the wallet or switch the network.
 * @returns
 */
export function WalletConnectButton({ children }: { children: ReactNode }) {
  const account = useAccount();
  const { openModal } = useModal();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { isNetworkSupported } = useIsNetworkSupported();

  if (account.isConnected && !isNetworkSupported) {
    return (
      <PrimaryButton
        type="button"
        onClick={() => switchNetworkAsync?.(mainnet.id)}
      >
        Switch Network
      </PrimaryButton>
    );
  }

  if (!account.isConnected) {
    return (
      <PrimaryButton
        type="button"
        onClick={() => openModal(Modal.WALLET)}
        title="Connect Wallet"
      >
        Connect Wallet
      </PrimaryButton>
    );
  }

  return <>{children}</>;
}
