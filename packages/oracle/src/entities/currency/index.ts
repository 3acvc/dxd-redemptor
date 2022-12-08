import { ChainId } from "../../constants";

export class Currency {
    public static USD = new Currency("USD", 18);

    public static ETH = new Currency("ETH", 18);
    public static XDAI = new Currency("XDAI", 18);
    private static readonly NATIVE_CURRENCY: Record<ChainId, Currency> = {
        [ChainId.ETHEREUM]: Currency.ETH,
        [ChainId.GNOSIS]: Currency.XDAI,
    };

    protected constructor(
        public readonly symbol: string,
        public readonly decimals: number
    ) {}

    public static getNative(chainId: ChainId) {
        return Currency.NATIVE_CURRENCY[chainId];
    }
}
