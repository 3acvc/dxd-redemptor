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
    // fetch recent block number
  const startBlock = await getBlockNumber(network);

    const subgraph = {
        specVersion: "0.0.4",
        schema: {
            file: "./schema.graphql",
        },
        dataSources: [
            {
                name: "Token",
                kind: "ethereum/contract",
                network,
                source: {
                    address: "0xa1d65E8fB6e87b60FECCBc582F7f97804B725521", // so we build the subgraph
                    startBlock,
                    abi: "ERC20",
                },
                mapping: {
                    kind: "ethereum/events",
                    apiVersion: "0.0.6",
                    language: "wasm/assemblyscript",
                    file: "./src/mappings/registery.ts",
                    entities: ["Token"],
                    abis: [
                        {
                            name: "ERC20",
                            file: "./abis/ERC20.json",
                        },
                    ],
                    blockHandlers: [
                        {
                            handler: "initSubgraph",
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
