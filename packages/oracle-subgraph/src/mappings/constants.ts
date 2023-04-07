import { Address, BigInt, dataSource } from "@graphprotocol/graph-ts";

export const ZERO_ADDRESS = Address.fromString(
    "0x0000000000000000000000000000000000000000"
);

export const NATIVE_TOKEN_ADDRESS = Address.fromString(
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);

export const MULTICALL3_ADDRESS = Address.fromString(
    "0xca11bde05977b3631167028862be2a173976ca11"
);

export const MAINNET = "mainnet";
export const XDAI = "xdai";
export const ARBITRUM_ONE = "arbitrum-one";
export const SNAPSHOT_FREQUENCY = BigInt.fromI32(dataSource.network() == MAINNET ? 10 : 60); // 10 blocks on Ethereum, 60 blocks on Gnosis Chain
export const ZERO = BigInt.fromI32(0)

// DXdao Avatar DXD vesting address
export let DXDAO_AVATAR_DXD_VESTING_ADDRESS = Address.fromString(
    "0xBd12eBb77eF167a5FF93b7E572b33f2526aE3fd0"
);

export class DXdaoSafes {
    static multichain(): Address[] {
        return [
            Address.fromString("0x22F3BB8defB1B9A6c18da5E1496cd1b15fc79d70"), // Operation Guild Safe
            Address.fromString("0x00Ce8162527Da8bD59056E2A54C3726886cBa676"), // DXvoice Guild Safe
            Address.fromString("0x76a48beCaD072b90761859bd2C517A7395775103"), // Swapr Guild Safe
            Address.fromString("0x975e8af284fcFEE19326a26908B45BD2fce1Cef0"), // Carrot Guild Safe
            Address.fromString("0x9467dcfd4519287e3878c018c02f5670465a9003"), // DXdao Multichain Safe
            Address.fromString('0x4942fbdc53b295563d59af51e6ddedceba5e332f'), // DXdao Closure Safe
        ];
    }
    static mainnet(): Address[] {
        return [];
    }
    static xdai(): Address[] {
        return [];
    }

    static arbitrumOne(): Address[] {
        return [];
    }

    static addressList(): Address[] {
        let network = dataSource.network() as string;
        if (network == MAINNET)
            return DXdaoSafes.mainnet().concat(DXdaoSafes.multichain());
        if (network == XDAI)
            return DXdaoSafes.xdai().concat(DXdaoSafes.multichain());
        if (network == ARBITRUM_ONE)
            return DXdaoSafes.arbitrumOne().concat(DXdaoSafes.multichain());
        return [];
    }
}

/**
 * DXswap relayer addresses. Same for all networks.
 */
export class SwaprRelayer {
    static address(): Address {
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
        return ZERO_ADDRESS;
    }
}

export class DXD {
    static address(): Address {
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
        if (network == ARBITRUM_ONE) {
            return Address.fromString(
                "0xc3ae0333f0f34aa734d5493276223d95b8f9cb37"
            );
        }
        return ZERO_ADDRESS;
    }
}

export class SWPR {
    static address(): Address {
        let network = dataSource.network() as string;
        if (network == MAINNET) {
            return Address.fromString(
                "0x6cacdb97e3fc8136805a9e7c342d866ab77d0957"
            );
        }
        if (network == XDAI) {
            return Address.fromString(
                "0x532801ed6f82fffd2dab70a19fc2d7b2772c4f4b"
            );
        }
        if (network == ARBITRUM_ONE) {
            return Address.fromString(
                "0xde903e2712288a1da82942dddf2c20529565ac30"
            );
        }
        return ZERO_ADDRESS;
    }
}

export class DXdaoAvatar {
    static address(): Address {
        const network = dataSource.network() as string;

        if (network == MAINNET)
            return Address.fromString(
                "0x519b70055af55A007110B4Ff99b0eA33071c720a"
            );
        if (network == XDAI)
            return Address.fromString(
                "0xe716ec63c5673b3a4732d22909b38d779fa47c3f"
            );
        if (network == ARBITRUM_ONE)
            return Address.fromString(
                "0x2B240b523f69b9aF3adb1C5924F6dB849683A394"
            );
        return ZERO_ADDRESS;
    }
}

export class DXdaoNavTokens {
    static mainnet(): Address[] {
        return [
            Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
            Address.fromString("0xae7ab96520de3a18e5e111b5eaab095312d7fe84"),
            Address.fromString("0xae78736cd615f374d3085123a210448e74fc6393"),
            Address.fromString("0xFe2e637202056d30016725477c5da089Ab0A043A"),
            Address.fromString("0x20bc832ca081b91433ff6c17f85701b6e92486c5"),
            Address.fromString("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
            Address.fromString("0x6B175474E89094C44Da98b954EedeAC495271d0F"),
            Address.fromString("0xdAC17F958D2ee523a2206206994597C13D831ec7"),
            Address.fromString("0x5f98805A4E8be255a32880FDeC7F6728C6568bA0"),
            Address.fromString("0x57ab1ec28d129707052df4df418d58a2d46d5f51"),
            Address.fromString("0x6810e776880c02933d47db1b9fc05908e5386b96"),
            Address.fromString("0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"),
            SWPR.address(),

        ];
    }

    static xdai(): Address[] {
        return [
            Address.fromString("0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"),
            Address.fromString("0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1"),
            Address.fromString("0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83"),
            Address.fromString("0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"),
            SWPR.address(),
        ];
    }

    static arbitrumOne(): Address[] {
        return [
            Address.fromString("0xff970a61a04b1ca14834a43f5de4533ebddb5cc8"),
            SWPR.address(),
        ];
    }

    static addressList(): Address[] {
        let network = dataSource.network() as string;
        if (network == MAINNET) return DXdaoNavTokens.mainnet();
        if (network == XDAI) return DXdaoNavTokens.xdai();
        if (network == ARBITRUM_ONE) return DXdaoNavTokens.arbitrumOne();
        return [];
    }
}
