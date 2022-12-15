import { Wallet } from "@ethersproject/wallet";
import { signQuote, verifyQuoteSignature } from ".";
import { Quote } from "../types";

describe("sign quote", () => {
    test("should work when recovering after signature", async () => {
        const redemptorAddress = Wallet.createRandom().address;
        const signer = Wallet.createRandom();
        const quote: Quote = {
            redeemedDXD: "10000000000000",
            circulatingDXDSupply: "10000000000000000",
            redeemedToken: "0x0000000000000000000000000000000000000000",
            redeemedTokenUSDPrice: "10000000000000000000000",
            redeemedAmount: "10000000000000000000000",
            collateralUSDValue: "10000000000000000",
        };
        const signature = signQuote(signer, quote, redemptorAddress);
        expect(verifyQuoteSignature(quote, redemptorAddress, signature)).toBe(
            signer.address
        );
    });
});
