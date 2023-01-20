import { ChainId, Currency } from "dxd-redemptor-oracle";

import { ReactComponent as GnosisChainLogo } from "../assets/gnosis-chain-logo.svg";
import { ReactComponent as EthereumLogo } from "../assets/ethereum-logo.svg";
import { getCurrencyChainId } from "../utils";

export function CurrencyChainLogo({ currency }: { currency: Currency }) {
    const currencyChainId = getCurrencyChainId(currency);

    if (currencyChainId === ChainId.ETHEREUM) {
        return <EthereumLogo width={24} height={24} fill="#000" />;
    } else if (currencyChainId === ChainId.GNOSIS) {
        return <GnosisChainLogo width={24} height={24} />;
    }
    return null;
}
