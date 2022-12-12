import { useState } from 'react'
import styled from 'styled-components'

import { ModalBackdrop, ModalContent, ModalOutterWrapper } from './Modal/styles'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortenAddress } from '../utils'

const ConnectorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export function WalletConnectButton() {
  const [isConnectWalletPopoverOpen, setIsConnectWalletPopoverOpen] =
    useState(false)

  const { disconnect } = useDisconnect()

  const { connectors, error, isLoading, pendingConnector, connectAsync } =
    useConnect()

  const account = useAccount()

  if (isConnectWalletPopoverOpen) {
    return (
      <ModalBackdrop onClick={() => setIsConnectWalletPopoverOpen(false)}>
        <ModalOutterWrapper onClick={(e) => e.stopPropagation()}>
          <ModalContent>
            <h2>Wallet</h2>
            <ConnectorList>
              {connectors.map((connector) => (
                <button
                  type='button'
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={async () => {
                    await connectAsync({ connector })
                    setIsConnectWalletPopoverOpen(false)
                  }}
                >
                  {connector.name}
                  {!connector.ready && ' (unsupported)'}
                  {isLoading &&
                    connector.id === pendingConnector?.id &&
                    ' (connecting)'}
                </button>
              ))}
              {error && (
                <div>
                  <p> {error.message}</p>
                </div>
              )}
            </ConnectorList>
          </ModalContent>
        </ModalOutterWrapper>
      </ModalBackdrop>
    )
  }

  if (account.isConnected) {
    return (
      <button onClick={() => disconnect()}>
        Disconnect {shortenAddress(account.address)}
      </button>
    )
  }

  return (
    <button onClick={() => setIsConnectWalletPopoverOpen(true)}>
      Connect Wallet
    </button>
  )
}
