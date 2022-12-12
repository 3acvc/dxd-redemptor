import { Wallet } from "@ethersproject/wallet";
import { recoverAddress } from "@ethersproject/transactions";
import { quoteEIP712Digest, signQuote } from ".";
import { Quote } from "../types";

describe.only("sign quote", () => {
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
        const digest = quoteEIP712Digest(quote, redemptorAddress);
        const signature = signQuote(signer, quote, redemptorAddress);
        expect(recoverAddress(digest, signature)).toBe(signer.address);
    });
});
