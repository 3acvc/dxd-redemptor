import { BigNumber, Contract, ContractTransaction, utils } from "ethers";
import { useState } from "react";
import styled from "styled-components";
import { useSigner, useSignTypedData } from "wagmi";
import { IQuoteResponse } from "../../types";
import { DAI, DXD, USDC, WETH } from "../../utils/tokens";
import { ERC20_ABI } from "../../abis/erc20";
import { REDEMPTOR_ABI } from "../../abis/redemptor";
import { AGGREGATOR_URL, REDEMPTOR_ADDRESS } from "../../constants";
import { FormGroup } from "../FormGroup";
import { QuoteResponse } from "../QuoteResponse";
import { WalletConnectButton } from "../form/WalletConnectButton";
import { Card, CardInnerWrapper } from "ui/components/Card";
import { NumberInput } from "components/form";
import { PrimaryButton } from "ui/components/Button";

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 360px;
  width: 100%;
  gap: 16px;
`;

const tokenOptions = [WETH, USDC, DAI];

export function RedeemContainer() {
  const provider = useSigner();
  const [transactionList, setTransactionList] = useState<ContractTransaction[]>(
    []
  );
  const [oracleQuoteResponse, setOracleQuoteResponse] =
    useState<IQuoteResponse | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [dxdAmount, setDXDAmount] = useState("0");
  const [redeemToken, setRedeemToken] = useState<typeof tokenOptions[0]>(
    tokenOptions[0]
  );
  const [getQuoteError, setGetQuoteError] = useState<Error | null>(null);
  const { signTypedDataAsync } = useSignTypedData();

  const onGetQuoteHandler = async () => {
    // Clear previous quote
    getQuoteError && setGetQuoteError(null);
    oracleQuoteResponse && setOracleQuoteResponse(null);
    if (dxdAmount.trim() === "") return;
    setIsFetchingQuote(true);

    const dxdAmountWei = utils.parseEther(dxdAmount);
    fetch(
      `${AGGREGATOR_URL}/quote?redeemedDXD=${dxdAmountWei}&redeemedToken=${redeemToken.address}`,
      {
        method: "GET",
      }
    )
      .then(async (response) => {
        console.log(response);

        if (response.ok) {
          const quoteJson = (await response.json()) as IQuoteResponse;
          setOracleQuoteResponse(quoteJson);
        } else {
          try {
            // Try to get the error message from the response
            const errorResponse = await response.json();
            setGetQuoteError(
              new Error(`Error getting quote: ${errorResponse.message}`)
            );
          } catch (error) {
            setGetQuoteError(new Error(`Error getting quote: Unknown error.`));
          }
        }
      })
      .catch((error) => {
        console.log(error);
        setGetQuoteError(error as Error);
      })
      .finally(() => {
        setIsFetchingQuote(false);
      });
  };

  const onRedeemHandler = async () => {
    try {
      if (!provider.data) throw new Error("No provider found");

      if (!oracleQuoteResponse) throw new Error("No available quote to redeem");

      const contract = new Contract(
        REDEMPTOR_ADDRESS,
        REDEMPTOR_ABI,
        provider.data
      );
      const tokenContract = new Contract(DXD.address, ERC20_ABI, provider.data);

      const signer = provider.data;
      const holder = await signer.getAddress();
      const now = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
      const permitExpiry = BigNumber.from(now.toString());
      const permitSpender = contract.address;
      const allowed = true;

      const [permitNonce, permitName, permitVersion] = await Promise.all([
        await tokenContract.nonces(holder),
        await tokenContract.name(),
        await tokenContract.version(),
      ]);

      const permitSignature = utils.splitSignature(
        await signTypedDataAsync({
          domain: {
            name: permitName,
            version: permitVersion,
            chainId: 1,
            verifyingContract: tokenContract.address as any,
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

      const unsignedRedeemTx = await contract.populateTransaction.redeem(
        oracleQuoteResponse.quote,
        oracleQuoteResponse.signatures,
        permitNonce,
        permitExpiry,
        permitSignature.v,
        permitSignature.r,
        permitSignature.s
      );

      console.log({
        unsignedRedeemTx,
      });

      const redeemTx = await signer.sendTransaction(unsignedRedeemTx);

      setTransactionList((prev) => {
        // unique tx
        if (!prev.find((tx) => tx.hash === redeemTx.hash)) {
          return [redeemTx, ...prev]; // add to the top
        }
        return prev;
      });

      setIsFetchingQuote(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingQuote(false);
    }
  };

  return (
    <RedeemCard>
      <CardInnerWrapper>
        <InnerContainer>
          <form>
            <FormGroup>
              <label>DXD Amount</label>
              <NumberInput
                value={dxdAmount}
                disabled={isFetchingQuote}
                onUserInput={setDXDAmount}
              />
            </FormGroup>
            <FormGroup>
              <label>Redeem To</label>
              <select
                value={redeemToken.address}
                disabled={isFetchingQuote}
                onChange={(e) => {
                  const token = tokenOptions.find(
                    (token) => token.address === e.target.value
                  );
                  if (token) {
                    setRedeemToken(token);
                  }
                }}
              >
                {tokenOptions.map((option) => (
                  <option value={option.address} key={option.address}>
                    {option.symbol}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup>
              <WalletConnectButton>
                <PrimaryButton
                  type="button"
                  onClick={onGetQuoteHandler}
                  disabled={
                    isFetchingQuote ||
                    dxdAmount.trim() === "" ||
                    dxdAmount === "0"
                  }
                  title="Get a quote for your DXD"
                >
                  Get Quote
                </PrimaryButton>

                {oracleQuoteResponse && (
                  <>
                    <QuoteResponse quoteResponse={oracleQuoteResponse} />
                    <FormGroup>
                      <button
                        type="button"
                        onClick={onRedeemHandler}
                        disabled={isFetchingQuote}
                        title="Redeem your DXD for ETH, USDC, or DAI"
                      >
                        Redeem
                      </button>
                    </FormGroup>
                  </>
                )}
              </WalletConnectButton>
            </FormGroup>
          </form>
          {getQuoteError && (
            <div>
              <p>{getQuoteError.message}</p>
            </div>
          )}
        </InnerContainer>
      </CardInnerWrapper>
    </RedeemCard>
  );
}

const RedeemCard = styled(Card)`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;
