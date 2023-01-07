import { Address, dataSource } from "@graphprotocol/graph-ts";

export const GENESIS_ADDRESS = "0x0000000000000000000000000000000000000000";

export const NATIVE_TOKEN_ADDRESS = Address.fromString(
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);

export const MULTICALL3_ADDRESS = Address.fromString(
    "0xca11bde05977b3631167028862be2a173976ca11"
);

export const MAINNET = "mainnet";
export const XDAI = "xdai";



/**
 * DXswap relayer addresses. Same for all networks.
 */
export class SwaprRelayer {
    static getAddress(): Address {
        let network = dataSource.network() as string;
        if (network == MAINNET) {
            return Address.fromString(
                "0xc088e949b9643d5c47a188084579b8d19b1b1112"
            );
        }
        if (network == XDAI) {
            return Address.fromString(
                "0x3921d59090810C1d52807cD8ca1Ea2289E1F89e6"
            );
        }
        return Address.fromString(GENESIS_ADDRESS);
    }
}

export class DXD {
    static getAddress(): Address {
        let network = dataSource.network() as string;
        if (network == MAINNET) {
            return Address.fromString(
                "0xa1d65E8fB6e87b60FECCBc582F7f97804B725521"
            );
        }
        if (network == XDAI) {
            return Address.fromString(
                "0xb90d6bec20993be5d72a5ab353343f7a0281f158"
            );
        }
        return Address.fromString(GENESIS_ADDRESS);
    }
}



export class DXdao {
    static avatarAddress(): Address {
        if (dataSource.network() == MAINNET) {
            return Address.fromString(
                "0x519b70055af55A007110B4Ff99b0eA33071c720a"
            );
        }
        if (dataSource.network() == XDAI) {
            return Address.fromString(
                "0xe716ec63c5673b3a4732d22909b38d779fa47c3f"
            );
        }
        return Address.fromString("0x0000000000000000000000000000000000000000");
    }
    static navTokenAddressMainnet(): Address[] {
        return [];
    }

    static navTokenAddressList(): Address[] {
        let network = dataSource.network() as string;

        if (network == MAINNET) {
            return [
                Address.fromString(
                    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                ),
                Address.fromString(
                    "0xae7ab96520de3a18e5e111b5eaab095312d7fe84"
                ),
                Address.fromString(
                    "0xae78736cd615f374d3085123a210448e74fc6393"
                ),
                Address.fromString(
                    "0xFe2e637202056d30016725477c5da089Ab0A043A"
                ),
                Address.fromString(
                    "0x20bc832ca081b91433ff6c17f85701b6e92486c5"
                ),
                Address.fromString(
                    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
                ),
                Address.fromString(
                    "0x6B175474E89094C44Da98b954EedeAC495271d0F"
                ),
                Address.fromString(
                    "0xdAC17F958D2ee523a2206206994597C13D831ec7"
                ),
                Address.fromString(
                    "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"
                ),
                Address.fromString(
                    "0x57ab1ec28d129707052df4df418d58a2d46d5f51"
                ),
                Address.fromString(
                    "0x6810e776880c02933d47db1b9fc05908e5386b96"
                ),
                Address.fromString(
                    "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"
                ),
            ];
        }

        if (network == XDAI) {
            return [
                Address.fromString(
                    "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"
                ),
                Address.fromString(
                    "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"
                ),
                Address.fromString(
                    "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"
                ),
                Address.fromString(
                    "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
                ),
            ];
        }

        return [];
    }
}


// DXdao Avatar DXD vesting address
export let DXDAO_AVATAR_DXD_VESTING_ADDRESS = Address.fromString(
    "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0"
);
