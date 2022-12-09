import { JsonRpcProvider } from "@ethersproject/providers";
import { quote } from ".";
import { ChainId } from "./constants";
import { Amount } from "./entities/amount";
import { DXD, WETH } from "./entities/token";
import { Currency } from "./entities/currency";

describe("quote", () => {
    let providerList: Record<ChainId, JsonRpcProvider>;
    let blockList: Record<ChainId, number>;

    beforeEach(async () => {
        providerList = {
            [ChainId.ETHEREUM]: new JsonRpcProvider("http://localhost:8545"),
            [ChainId.GNOSIS]: new JsonRpcProvider(
                "https://rpc.gnosischain.com"
            ),
        };
        blockList = {
            [ChainId.ETHEREUM]:
                (await providerList[ChainId.ETHEREUM].getBlock("latest"))
                    .number - 10,
            [ChainId.GNOSIS]:
                (await providerList[ChainId.GNOSIS].getBlock("latest")).number -
                10,
        };
    });

    test("works correctly", async () => {
        // redeem 10 dxd for weth
        const redeemedToken = WETH[ChainId.ETHEREUM];
        const redeemedDXD = new Amount(DXD[ChainId.ETHEREUM], 10);
        const oracleQuote = await quote(
            blockList,
            redeemedToken,
            redeemedDXD,
            providerList
        );
        console.log(oracleQuote);
    });

    test("should work with ETH", async () => {
        // redeem 10 dxd for weth
        const redeemedToken = Currency.ETH;
        const redeemedDXD = new Amount(DXD[ChainId.ETHEREUM], 10);
        const oracleQuote = await quote(
            blockList,
            redeemedToken,
            redeemedDXD,
            providerList
        );
        expect(oracleQuote).toBeDefined();
        expect(oracleQuote.redeemedToken).toEqual(
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        );
    });
});
