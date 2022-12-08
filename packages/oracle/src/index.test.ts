import { quote } from ".";
import { ChainId, PROVIDER } from "./constants";
import { Amount } from "./entities/amount";
import { DXD, WETH } from "./entities/token";

describe("quote", () => {
    test("works correctly", async () => {
        // redeem 10 dxd for weth
        const redeemedToken = WETH[ChainId.ETHEREUM];
        const redeemedDXD = new Amount(DXD[ChainId.ETHEREUM], 10);
        const block: Record<ChainId, number> = {
            [ChainId.ETHEREUM]:
                (await PROVIDER[ChainId.ETHEREUM].getBlock("latest")).number -
                10,
            [ChainId.GNOSIS]:
                (await PROVIDER[ChainId.GNOSIS].getBlock("latest")).number - 10,
        };
        const oracleQuote = await quote(block, redeemedToken, redeemedDXD);
        console.log(oracleQuote);
    });
});
