import { mainnet } from "wagmi/chains";
import styled from "styled-components";
import { useConnect } from "wagmi";
import { Modal, useModal } from "../../modal";
import { PrimaryButton } from "../../ui/components/Button/Button";
import {
  ModalBackdrop,
  ModalHeader,
  ModalInnerWrapper,
  ModalOutterWrapper,
  ModalContent as ModalContentBase,
} from "./styles";

export function ConnectWalletModal() {
  const { closeModal, modal } = useModal();
  const { connectors, isLoading, pendingConnector, connectAsync } =
    useConnect();

  if (modal == null || modal !== Modal.WALLET) {
    return null;
  }

  return (
    <ModalBackdrop onClick={closeModal}>
      <ModalOutterWrapper onClick={(e) => e.stopPropagation()}>
        <ModalInnerWrapper $width="100%">
          <ModalHeader>
            <h2>Choose A Wallet</h2>
          </ModalHeader>
          <ModalContent>
            {connectors.map((connector) => (
              <WalletButton
                type="button"
                disabled={!connector.ready}
                key={connector.id}
                onClick={async () => {
                  await connectAsync({
                    connector,
                    chainId: mainnet.id,
                  });
                  closeModal();
                }}
              >
                {connector.name}
                {!connector.ready && " (unsupported)"}
                {isLoading &&
                  connector.id === pendingConnector?.id &&
                  " (connecting)"}
              </WalletButton>
            ))}
          </ModalContent>
        </ModalInnerWrapper>
      </ModalOutterWrapper>
    </ModalBackdrop>
  );
}

const WalletButton = styled(PrimaryButton)`
  margin-bottom: 1rem;
`;

const ModalContent = styled(ModalContentBase)`
  paddind-top: 0;
`;
