import { defaultAbiCoder } from "@ethersproject/abi";
import { Log } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { ERC20_TRANSFER_SIGHASH } from "../../../constants";

export const addressEqual = (a: string, b: string): boolean => {
    return a.toLowerCase() === b.toLowerCase();
};

interface DecodedTransferLog {
    tokenAddress: string;
    from: string;
    to: string;
    amount: BigNumber;
}

export const decodeERC20TransferLog = (log: Log): DecodedTransferLog | null => {
    console.log(log);
    const [sigHash] = log.topics;
    // by spec, erc20 transfer only have from and to as indexed params.
    // this filters out erc721 token transfers for which the token id
    // is also indexed (log topics length check)
    if (sigHash !== ERC20_TRANSFER_SIGHASH || log.topics.length > 3)
        return null;
    const [, encodedFrom, encodedTo] = log.topics;
    const [from] = defaultAbiCoder.decode(["address"], encodedFrom);
    const [to] = defaultAbiCoder.decode(["address"], encodedTo);
    const [amount] = defaultAbiCoder.decode(["uint256"], log.data);
    return {
        tokenAddress: log.address,
        from,
        to,
        amount,
    };
};
