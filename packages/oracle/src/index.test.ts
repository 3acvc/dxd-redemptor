import { JsonRpcProvider } from "@ethersproject/providers";
import { getQuote } from ".";
import { ChainId } from "./constants";

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
        const tokenAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

        const oracleQuote = await getQuote(
            blockList,
            tokenAddr,
            (10 * 10 ** 18).toString(),
            providerList
        );
        console.log(oracleQuote);
        expect(oracleQuote).toBeDefined();
        expect(oracleQuote.redeemedToken).toEqual(tokenAddr);
    });

    test("should work with ETH", async () => {
        const tokenAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

        const oracleQuote = await getQuote(
            blockList,
            tokenAddr,
            (10 * 10 ** 18).toString(),
            providerList
        );
        expect(oracleQuote).toBeDefined();
        expect(oracleQuote.redeemedToken).toEqual(tokenAddr);
    });

    test("Quote deadline should be in the future", async () => {
        const currentBlockNumber = await providerList[
            ChainId.ETHEREUM
        ].getBlockNumber();

        const tokenAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const oracleQuote = await getQuote(
            blockList,
            tokenAddr,
            (10 * 10 ** 18).toString(),
            providerList
        );
        expect(oracleQuote).toBeDefined();
        expect(parseInt(oracleQuote.deadline)).toBeGreaterThan(
            currentBlockNumber
        );
    });

    test("Quote deadline can be overriden", async () => {
        const expectedBlockNumber =
            (await providerList[ChainId.ETHEREUM].getBlockNumber()) + 100;

        const tokenAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        const oracleQuote = await getQuote(
            blockList,
            tokenAddr,
            (10 * 10 ** 18).toString(),
            providerList,
            expectedBlockNumber
        );
        expect(oracleQuote).toBeDefined();
        expect(parseInt(oracleQuote.deadline)).toBeGreaterThan(
            expectedBlockNumber
        );
    });
});
