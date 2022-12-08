import styled from "styled-components";
import { Contract, ContractTransaction, utils } from "ethers";
import { useState } from "react";
import { WalletConnectButton } from "./components/ConnectButton";
import { FormGroup } from "./components/FormGroup";
import { ETH, WETH, USDC, DAI } from "./utils/tokens";
import { useSigner } from "wagmi";
import { REDEMPTOR_ABI } from "./abis/redemptor";
import { TransactionList } from "./components/TransactionList";

interface QuoteResponse {
    quote: {
        redeemedDXD: string;
        circulatingDXDSupply: string;
        redeemedToken: string;
        redeemedTokenUSDPrice: string;
        redeemedAmount: string;
        collateralUSDValue: string;
    };
    signatures: string[];
}

const AGGREGATOR_URL = process.env.AGGREGATOR_URL || "http://localhost:4000";

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
`;

const tokenOptions = [ETH, WETH, USDC, DAI];

function App() {
    const provider = useSigner();
    const [transactionList, setTransactionList] = useState<
        ContractTransaction[]
    >([]);
    const [oracleQuote, setOracleQuote] = useState<QuoteResponse | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const [dxdAmount, setDXDAmount] = useState("");
    const [redeemToken, setRedeemToken] = useState(tokenOptions[0].address);

    const onGetQuoteHandler = async () => {
        try {
            setIsFetchingQuote(true);

            const dxdAmountWei = utils.parseEther(dxdAmount);
            const quote = await fetch(
                `${AGGREGATOR_URL}/quote?redeemedDXD=${dxdAmountWei}&redeemedToken=${redeemToken}`,
                {
                    method: "GET",
                }
            );
            const quoteJson = (await quote.json()) as QuoteResponse;
            console.log(quote);
            setOracleQuote(quoteJson);
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetchingQuote(false);
        }
    };

    const onRedeemHandler = async () => {
        try {
            if (!provider.data) throw new Error("No provider found");

            if (!oracleQuote) throw new Error("No available quote to redeem");

            const contract = new Contract(
                "0x0x0x0",
                REDEMPTOR_ABI,
                provider.data
            );

            if (!contract) {
                throw new Error("Contract not found");
            }

            const redeemTx = await contract.redeem(
                oracleQuote.quote,
                oracleQuote.signatures
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
                                value={redeemToken}
                                disabled={isFetchingQuote}
                                onChange={(e) => setRedeemToken(e.target.value)}
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
                        {oracleQuote && (
                            <>
                                <div>
                                    <span>
                                        redeemedAmount:{" "}
                                        {utils.formatUnits(
                                            oracleQuote.quote.redeemedAmount,
                                            utils.getAddress(
                                                oracleQuote.quote.redeemedToken
                                            ) === utils.getAddress(USDC.address)
                                                ? 6
                                                : 18
                                        )}
                                    </span>
                                    <span>
                                        collateralUSDValue:{" "}
                                        {utils.formatUnits(
                                            oracleQuote.quote.collateralUSDValue
                                        )}
                                    </span>
                                    <span>
                                        redeemedTokenUSDPrice:{" "}
                                        {utils.formatUnits(
                                            oracleQuote.quote
                                                .redeemedTokenUSDPrice
                                        )}
                                    </span>
                                </div>
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
