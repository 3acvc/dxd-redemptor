import { writeFile } from "fs/promises";
import { stringify as yamlStringify } from "yaml";

const ETHEREUM_RPC_ENDPOINT =
    "https://eth-mainnet.g.alchemy.com/v2/EY3WaGaUwnSMBGBXwVzUiAssjPL_zQeM";
const GNOSIS_RPC_ENDPOINT = "https://rpc.gnosischain.com";

async function getBlockNumber(network: string): Promise<number> {
    let endpoint =
        network === "mainnet" ? ETHEREUM_RPC_ENDPOINT : GNOSIS_RPC_ENDPOINT;

    const blockNumber = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
            method: "eth_blockNumber",
            params: [],
            id: 1,
            jsonrpc: "2.0",
        }),
    }).then((res) => res.json());

    return parseInt(blockNumber.result, 16);
}

async function main() {
    // get network from command line
    const network = process.argv[2];
    // validate network
    if (!network || !["mainnet", "xdai"].includes(network)) {
        throw new Error("Invalid network. Must be one of: mainnet, xdai");
    }

    let dxdTokenAdresss = "0xa1d65e8fb6e87b60feccbc582f7f97804b725521";
    let startBlock = 16341493; // this block emits a NewCallProposal event from DAOstack scheme

    startBlock = await getBlockNumber(network);

    // fetch recent block number
    // const startBlock = await getBlockNumber(network);
    let source = {
        address: "0xb3ec6089556cca49549be01ff446cf40fa81c84d",
        startBlock, // this block emits a NewCallProposal event from DAOstack scheme
        abi: "ENSScheme",
    };
    let eventHandlers = [
        {
            event:
                "NewCallProposal(indexed address,indexed bytes32,bytes,uint256,string)",
            handler: "handleInitSubgraph",
        },
    ];
    const blockHandlers = [
        {
            handler: "handleBlock",
        },
    ];

    if (network === "xdai") {
        // startBlock = 25836452;
        dxdTokenAdresss = "0xb90d6bec20993be5d72a5ab353343f7a0281f158";
        source = {
            address: "0xa80ea8941f1772792beb99648ba4ff8dc1d4c849",
            abi: "DXdaoNAV",
            startBlock,
        };
        eventHandlers = [
            {
                event: "NavInitialized()",
                handler: "handleInitSubgraph",
            },
        ];
    }

    const subgraph = {
        specVersion: "0.0.4",
        features: ["nonFatalErrors"],
        schema: {
            file: "./schema.graphql",
        },
        dataSources: [
            {
                name: "Token",
                kind: "ethereum/contract",
                network,
                source,
                mapping: {
                    kind: "ethereum/events",
                    apiVersion: "0.0.6",
                    language: "wasm/assemblyscript",
                    file: "./src/mappings/registery.ts",
                    entities: ["Token"],
                    abis: [
                        {
                            name: "ENSScheme",
                            file: "./abis/ENSScheme.json",
                        },
                        {
                            name: "ERC20",
                            file: "./abis/ERC20.json",
                        },
                        {
                            name: "Multicall3",
                            file: "./abis/Multicall3.json",
                        },
                        {
                            name: "DXdaoNAV",
                            file: "./abis/DXdaoNAV.json",
                        },
                    ],
                    blockHandlers,
                },
            },
            {
                name: "DXDToken",
                kind: "ethereum/contract",
                network,
                source: {
                    address: dxdTokenAdresss,
                    startBlock: startBlock + 10,
                    abi: "ERC20",
                },
                mapping: {
                    kind: "ethereum/events",
                    apiVersion: "0.0.6",
                    language: "wasm/assemblyscript",
                    file: "./src/mappings/token.ts",
                    entities: ["TransferEvent"],
                    abis: [
                        {
                            name: "ERC20",
                            file: "./abis/ERC20.json",
                        },
                    ],
                    eventHandlers: [
                        {
                            event:
                                "Transfer(indexed address,indexed address,uint256)",
                            handler: "handleDXDTrasnfer",
                        },
                    ],
                },
            },
        ],
        templates: [
            {
                name: "NAVToken",
                kind: "ethereum/contract",
                network,
                source: {
                    abi: "ERC20",
                },
                mapping: {
                    kind: "ethereum/events",
                    apiVersion: "0.0.6",
                    language: "wasm/assemblyscript",
                    file: "./src/mappings/token.ts",
                    entities: ["TransferEvent"],
                    abis: [
                        {
                            name: "ERC20",
                            file: "./abis/ERC20.json",
                        },
                        {
                            name: "Multicall3",
                            file: "./abis/Multicall3.json",
                        }
                    ],
                    eventHandlers: [
                        {
                            event:
                                "Transfer(indexed address,indexed address,uint256)",
                            handler: "handleTransfer",
                        },
                    ],
                },
            },
        ],
    };

    await writeFile(`./subgraph.yaml`, yamlStringify(subgraph));
}

main();
