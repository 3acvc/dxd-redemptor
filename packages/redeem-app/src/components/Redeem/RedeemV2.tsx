import { BigNumber, Contract, utils } from "ethers";
import { useState } from "react";
import styled from "styled-components";
import { useSigner, useSignTypedData } from "wagmi";
import { DXD } from "../../utils/tokens";
import { REDEMPTOR_ABI } from "../../abis/redemptor";
import { FormGroup } from "../FormGroup";
import { WalletConnectButton } from "../form/WalletConnectButton";
import { Card, CardInnerWrapper } from "ui/components/Card";
import { NumberInput } from "components/form";
import { PrimaryButton } from "ui/components/Button";
import { useTokenContract } from "hooks/useContract";
import { FlexContainer } from "ui/components/Container";

/**
 * A logic container for DXdao closure redeem
 * @returns
 */
export function RedeemV2Container() {
  const provider = useSigner();
  const [isRedeeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<Error | null>(null);
  const dxdTokenContract = useTokenContract(DXD.address, true);
  const [dxdAmount, setDXDAmount] = useState("0");
  const { signTypedDataAsync } = useSignTypedData();

  const onRedeemHandler = async () => {
    try {
      if (!provider.data) throw new Error("No provider found");
      if (!dxdTokenContract) throw new Error("No DXD token contract found");

      const contract = new Contract("", REDEMPTOR_ABI, provider.data);

      const signer = provider.data;
      const holder = await signer.getAddress();
      const now = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
      const permitExpiry = BigNumber.from(now.toString());
      const permitSpender = contract.address;
      const allowed = true;

      const [permitNonce, permitName, permitVersion] = await Promise.all([
        await dxdTokenContract.nonces(holder as any),
        await dxdTokenContract.name(),
        await dxdTokenContract.version(),
      ]);

      // TODO: Add logic for redeeming DXD to ETH
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const permitSignature = utils.splitSignature(
        await signTypedDataAsync({
          domain: {
            name: permitName,
            version: permitVersion,
            chainId: 1,
            verifyingContract: dxdTokenContract.address as any,
          },
          types: {
            Permit: [
              {
                name: "holder",
                type: "address",
              },
              {
                name: "spender",
                type: "address",
              },
              {
                name: "nonce",
                type: "uint256",
              },
              {
                name: "expiry",
                type: "uint256",
              },
              {
                name: "allowed",
                type: "bool",
              },
            ],
          },
          value: {
            holder: holder as any,
            spender: permitSpender as any,
            nonce: permitNonce,
            expiry: permitExpiry,
            allowed,
          },
        })
      );

      // const unsignedRedeemTx =
      //   await dxdTokenContract.(
      //     oracleQuoteResponse.quote,
      //     oracleQuoteResponse.signatures,
      //     permitNonce,
      //     permitExpiry,
      //     permitSignature.v,
      //     permitSignature.r,
      //     permitSignature.s
      //   );
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRedeemError(error as any);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <CardContainer>
      <Card $height="100%" $width="100%">
        <CardInnerWrapper>
          <form>
            <FormGroup>
              <label>DXD Amount</label>
              <NumberInput
                value={dxdAmount}
                disabled={isRedeeeming}
                onUserInput={setDXDAmount}
              />
            </FormGroup>
            <FormGroup>
              <WalletConnectButton>
                <FormGroup>
                  <PrimaryButton
                    type="button"
                    onClick={onRedeemHandler}
                    disabled={isRedeeeming}
                    title="Redeem your DXD for ETH"
                  >
                    Redeem
                  </PrimaryButton>
                </FormGroup>
              </WalletConnectButton>
            </FormGroup>
          </form>
          {redeemError ? (
            <div>
              <p>{redeemError.message}</p>
            </div>
          ) : null}
        </CardInnerWrapper>
      </Card>
    </CardContainer>
  );
}

const CardContainer = styled(FlexContainer)`
  flex-direction: column;
  max-width: 600px;
  padding-top: 100px;
`;
