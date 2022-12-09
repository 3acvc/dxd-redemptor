import { JsonRpcProvider } from "@ethersproject/providers";
import { quote } from ".";
import { ChainId } from "./constants";
import { Amount } from "./entities/amount";
import { DXD, WETH } from "./entities/token";

describe("quote", () => {
    test("works correctly", async () => {
        // redeem 10 dxd for weth
        const redeemedToken = WETH[ChainId.ETHEREUM];
        const redeemedDXD = new Amount(DXD[ChainId.ETHEREUM], 10);
        const provider = {
            [ChainId.ETHEREUM]: new JsonRpcProvider("http://localhost:8545"),
            [ChainId.GNOSIS]: new JsonRpcProvider(
                "https://rpc.gnosischain.com"
            ),
        };

        const block: Record<ChainId, number> = {
            [ChainId.ETHEREUM]:
                (await provider[ChainId.ETHEREUM].getBlock("latest")).number -
                10,
            [ChainId.GNOSIS]:
                (await provider[ChainId.GNOSIS].getBlock("latest")).number - 10,
        };

        const oracleQuote = await quote(
            block,
            redeemedToken,
            redeemedDXD,
            provider
        );
        console.log(oracleQuote);
    });
});
