import { JsonRpcProvider } from "@ethersproject/providers";
import { Amount, DXD, getQuote } from ".";
import { ChainId } from "./constants";
import { USDC, WETH } from "./entities/token";
import * as subgraph from "./utils/subgraph";

describe("quote", () => {
  let providerList: Record<ChainId, JsonRpcProvider>;
  let block: Record<ChainId, number>;
  const subgraphEndpointList = {
    // will be mocked in beforeEach
    [ChainId.ETHEREUM]:
      "https://thegraph.com/hosted-service/subgraph/adamazad/dxdao-dxd-redemption-ethereum",
    [ChainId.GNOSIS]:
      "https://thegraph.com/hosted-service/subgraph/adamazad/dxdao-dxd-redemption-gnosis",
  };
  const nativeTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  beforeEach(async () => {
    providerList = {
      [ChainId.ETHEREUM]: new JsonRpcProvider("https://eth.llamarpc.com"),
      [ChainId.GNOSIS]: new JsonRpcProvider("https://rpc.ankr.com/gnosis"),
    };
    block = {
      [ChainId.ETHEREUM]:
        (await providerList[ChainId.ETHEREUM].getBlock("latest")).number - 10,
      [ChainId.GNOSIS]:
        (await providerList[ChainId.GNOSIS].getBlock("latest")).number - 10,
    };

    const spy = jest.spyOn(subgraph, "getTokenBalancesSnapshotAtBlock");
    spy.mockReturnValue({
      circulatingDXDSupply: new Amount(DXD[ChainId.ETHEREUM], 33_000),
      tokenBalances: [
        new Amount(WETH[ChainId.ETHEREUM], 1_000),
        new Amount(USDC[ChainId.ETHEREUM], 100_000),
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("works correctly", async () => {
    const tokenAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const oracleQuote = await getQuote({
      block,
      redeemedTokenAddress: tokenAddr,
      redeemedDxdWeiAmount: (10 * 10 ** 18).toString(),
      providerList,
      subgraphEndpointList,
    });
    console.log(oracleQuote);
    expect(oracleQuote).toBeDefined();
    expect(oracleQuote.redeemedToken).toEqual(tokenAddr);
  });

  test.skip("should work with ETH", async () => {
    const oracleQuote = await getQuote({
      block,
      redeemedTokenAddress: nativeTokenAddress,
      redeemedDxdWeiAmount: (10 * 10 ** 18).toString(),
      providerList,
      subgraphEndpointList,
    });
    expect(oracleQuote).toBeDefined();
    expect(oracleQuote.redeemedToken).toEqual(nativeTokenAddress);
  });

  test.skip("Quote deadline should be in the future", async () => {
    const currentBlockNumber = await providerList[
      ChainId.ETHEREUM
    ].getBlockNumber();

    const oracleQuote = await getQuote({
      block,
      redeemedTokenAddress: nativeTokenAddress,
      redeemedDxdWeiAmount: (10 * 10 ** 18).toString(),
      providerList,
      subgraphEndpointList,
    });
    expect(oracleQuote).toBeDefined();
    expect(parseInt(oracleQuote.deadline)).toBeGreaterThan(currentBlockNumber);
  });

  test.skip("Quote deadline can be overriden", async () => {
    const expectedBlockNumber =
      (await providerList[ChainId.ETHEREUM].getBlockNumber()) + 100;

    const oracleQuote = await getQuote({
      block,
      redeemedTokenAddress: nativeTokenAddress,
      redeemedDxdWeiAmount: (10 * 10 ** 18).toString(),
      providerList,
      subgraphEndpointList,
      deadline: expectedBlockNumber,
    });
    expect(oracleQuote).toBeDefined();
    expect(parseInt(oracleQuote.deadline)).toEqual(expectedBlockNumber);
  });
});
