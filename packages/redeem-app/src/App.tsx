import styled from "styled-components";
import { BigNumber, Contract, ContractTransaction, utils } from "ethers";
import { useState } from "react";
import { WalletConnectButton } from "./components/ConnectButton";
import { FormGroup } from "./components/FormGroup";
import { ETH, WETH, USDC, DAI, DXD } from "./utils/tokens";
import { useSigner, useSignTypedData } from "wagmi";
import { REDEMPTOR_ABI } from "./abis/redemptor";
import { TransactionList } from "./components/TransactionList";
import { QuoteResponse } from "./components/QuoteResponse";
import { IQuoteResponse } from "./types";
import { ERC20_ABI } from "./abis/erc20";

const AGGREGATOR_URL = process.env.AGGREGATOR_URL || "http://localhost:4000";
const REDEMPTOR_ADDRESS =
    process.env.REDEMPTOR_ADDRESS ||
    "0xAa02DffF49475F9759295A9525987686d2de47b2";

const FlexContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const InnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 360px;
    width: 100%;
    gap: 16px;
`;

const tokenOptions = [ETH, WETH, USDC, DAI];

function App() {
    const provider = useSigner();
    const [transactionList, setTransactionList] = useState<
        ContractTransaction[]
    >([]);
    const [oracleQuoteResponse, setOracleQuoteResponse] =
        useState<IQuoteResponse | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const [dxdAmount, setDXDAmount] = useState("");
    const [redeemToken, setRedeemToken] = useState<typeof tokenOptions[0]>(
        tokenOptions[0]
    );

    const { signTypedDataAsync } = useSignTypedData();

    const onGetQuoteHandler = async () => {
        try {
            setIsFetchingQuote(true);

            const dxdAmountWei = utils.parseEther(dxdAmount);
            const quote = await fetch(
                `${AGGREGATOR_URL}/quote?redeemedDXD=${dxdAmountWei}&redeemedToken=${redeemToken.address}`,
                {
                    method: "GET",
                }
            );
            const quoteJson = (await quote.json()) as IQuoteResponse;
            console.log(quote);
            setOracleQuoteResponse(quoteJson);
        } catch (error) {
            console.log(error);
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const onRedeemHandler = async () => {
        try {
            if (!provider.data) throw new Error("No provider found");

            if (!oracleQuoteResponse)
                throw new Error("No available quote to redeem");

            const contract = new Contract(
                REDEMPTOR_ADDRESS,
                REDEMPTOR_ABI,
                provider.data
            );

            const tokenContract = new Contract(
                DXD.address,
                ERC20_ABI,
                provider.data
            );

            const signer = provider.data;
            const holder = await signer.getAddress();
            const now = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day
            const expiry = BigNumber.from(now.toString());
            const spender = contract.address;
            const allowed = true;
            const nonce = await tokenContract.nonces(holder);
            const name = await tokenContract.name();
            const version = await tokenContract.version();

            const permitSignature = utils.splitSignature(
                await signTypedDataAsync({
                    domain: {
                        name,
                        version,
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
                        spender: spender as any,
                        nonce,
                        expiry,
                        allowed,
                    },
                })
            );

            const redeemTx = await contract.redeem(
                oracleQuoteResponse.quote,
                oracleQuoteResponse.signatures,
                expiry,
                permitSignature.v,
                permitSignature.r,
                permitSignature.s
            );

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
        <div className="container">
            <FlexContainer>
                <InnerContainer>
                    <form>
                        <FormGroup>
                            <label>DXD Amount</label>
                            <input
                                min="0"
                                type="number"
                                value={dxdAmount}
                                disabled={isFetchingQuote}
                                onChange={(e) => {
                                    const dxdValInt = parseInt(e.target.value);
                                    const value = Math.abs(dxdValInt);
                                    setDXDAmount(
                                        value.toString().replace("e", "")
                                    );
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <label>Redeem To</label>
                            <select
                                value={redeemToken.address}
                                disabled={isFetchingQuote}
                                onChange={(e) => {
                                    const token = tokenOptions.find(
                                        (token) =>
                                            token.address === e.target.value
                                    );
                                    if (token) {
                                        setRedeemToken(token);
                                    }
                                }}
                            >
                                {tokenOptions.map((option) => (
                                    <option
                                        value={option.address}
                                        key={option.address}
                                    >
                                        {option.symbol}
                                    </option>
                                ))}
                            </select>
                        </FormGroup>
                        <FormGroup>
                            <button
                                type="button"
                                onClick={onGetQuoteHandler}
                                disabled={isFetchingQuote}
                                title="Get a quote for your DXD"
                            >
                                Get Quote
                            </button>
                        </FormGroup>
                        {oracleQuoteResponse && (
                            <>
                                <QuoteResponse
                                    quoteResponse={oracleQuoteResponse}
                                />
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
                    </form>
                    <WalletConnectButton />
                    <TransactionList transactions={transactionList} />
                </InnerContainer>
            </FlexContainer>
        </div>
    );
}

export default App;
