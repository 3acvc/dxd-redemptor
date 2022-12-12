import { hashQuote } from ".";

// in order to get this hash, execute the `GetOracleMessageHash` script with the following in the `.env` file:
//
// ```
// export REDEEMED_DXD=10000000000000
// export CIRCULATING_DXD_SUPPLY=10000000000000000
// export REDEEMED_TOKEN=0x0000000000000000000000000000000000000000
// export REDEEMED_TOKEN_USD_PRICE=10000000000000000000000
// export REDEEMED_AMOUNT=10000000000000000000000
// export COLLATERAL_USD_VALUE=10000000000000000
// ```
//
// detailed instructions in the `CONTRIBUTING.md` file

const EXPECTED_HASH =
    "0x36ec084e57ad076f1290bff1d1836d25c26bc68dfb541cc6dad92290baa63959";

describe("hash quote", () => {
    test("should work with a precomputed hash", async () => {
        expect(
            hashQuote({
                redeemedDXD: "10000000000000",
                circulatingDXDSupply: "10000000000000000",
                redeemedToken: "0x0000000000000000000000000000000000000000",
                redeemedTokenUSDPrice: "10000000000000000000000",
                redeemedAmount: "10000000000000000000000",
                collateralUSDValue: "10000000000000000",
            })
        ).toBe(EXPECTED_HASH);
    });
});
