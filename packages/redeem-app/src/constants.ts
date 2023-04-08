import { ChainId } from "dxd-redemptor-oracle";

export const AGGREGATOR_URL =
  process.env.AGGREGATOR_URL || "http://localhost:4000";
export const REDEMPTOR_ADDRESS =
  process.env.REACT_APP_REDEMPTOR_ADDRESS ||
  "0xAa02DffF49475F9759295A9525987686d2de47b2";

export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase();
export const SUBGRAPH_BLOCK_BUFFER = 20;

export const DXDAO_ADDRESS_LIST: {
  address: string;
  chainId: ChainId[];
  label: string;
  hide?: boolean;
}[] = [
  {
    address: "0x519b70055af55a007110b4ff99b0ea33071c720a",
    chainId: [ChainId.ETHEREUM],
    label: "DXdao Avatar",
  },
  {
    address: "0xe716ec63c5673b3a4732d22909b38d779fa47c3f",
    chainId: [ChainId.GNOSIS],
    label: "DXdao Avatar",
  },
  {
    address: "0xa1d65e8fb6e87b60feccbc582f7f97804b725521",
    chainId: [ChainId.ETHEREUM],
    label: "DXD Token Contract",
  },
  {
    address: "0xc088e949b9643d5c47a188084579b8d19b1b1112",
    chainId: [ChainId.ETHEREUM],
    label: "Swapr Relayer",
  },
  {
    address: "0x3921d59090810c1d52807cd8ca1ea2289e1f89e6",
    chainId: [ChainId.GNOSIS],
    label: "Swapr Relayer",
  },
  {
    address: "0x9467dcfd4519287e3878c018c02f5670465a9003",
    chainId: [ChainId.ETHEREUM, ChainId.GNOSIS],
    label: "DXdao Multichain Safe",
  },
  {
    address: "0x22f3bb8defb1b9a6c18da5e1496cd1b15fc79d70",
    chainId: [ChainId.ETHEREUM, ChainId.GNOSIS],
    label: "Operations Guild Safe",
    hide: true,
  },
  {
    address: "0x00ce8162527da8bd59056e2a54c3726886cba676",
    chainId: [ChainId.ETHEREUM, ChainId.GNOSIS],
    label: "DXvoice Guild Safe",
    hide: true,
  },
  {
    address: "0x76a48becad072b90761859bd2c517a7395775103",
    chainId: [ChainId.ETHEREUM, ChainId.GNOSIS],
    label: "Swapr Guild Safe",
    hide: true,
  },
  {
    address: "0x975e8af284fcfee19326a26908b45bd2fce1cef0",
    chainId: [ChainId.ETHEREUM, ChainId.GNOSIS],
    label: "Carrot Guild Safe",
    hide: true,
  },
  {
    address: "0x4942fbdc53b295563d59af51e6ddedceba5e332f",
    chainId: [ChainId.ETHEREUM, ChainId.GNOSIS],
    label: "DXdao Closure Safe",
  },
  {
    address: "0xbd12ebb77ef167a5ff93b7e572b33f2526ae3fd0",
    chainId: [ChainId.ETHEREUM],
    label: "DXdao DXD Vesting Contract",
  },
  {
    address: "0x5f239a6671bc6d2baef6d7cd892296e678810882",
    chainId: [ChainId.ETHEREUM],
    label: "Hats Finance Committee Safe",
  },
];
