#!/usr/bin/env node

import { execSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { ContractFactory } from "@ethersproject/contracts";
import ganache from "ganache";
import ora from "ora";
import chalk from "chalk";

const [forkUrl] = process.argv.slice(2);
if (!forkUrl) {
    console.error("Please specify an RPC endpoint to fork mainnet from.");
    process.exit(0);
}

const PORT = 8545;
const MNEMONIC = "test test test test test test test test test test test junk";
const DERIVATION_PATH = "m/44'/60'/0'/0/0";

const importMetaUrlPath = fileURLToPath(import.meta.url);
const __dirname = dirname(importMetaUrlPath);
const require = createRequire(importMetaUrlPath);
const spinner = ora();

const clearConsole = () => {
    if (process.stdout.isTTY)
        process.stdout.write(
            process.platform === "win32"
                ? "\x1B[2J\x1B[0f"
                : "\x1B[2J\x1B[3J\x1B[H"
        );
};

try {
    // get ganache going
    spinner.start(`Starting ${chalk.cyan("Ganache")}`);
    const ganacheServer = ganache.server({
        fork: { url: forkUrl },
        chain: {
            chainId: 1,
        },
        wallet: {
            mnemonic: MNEMONIC,
            hdPath: DERIVATION_PATH,
        },
        logging: {
            quiet: true,
        },
    });
    await new Promise((resolve, reject) => {
        ganacheServer.once("open").then(() => {
            resolve();
        });
        ganacheServer.listen(PORT).catch(reject);
    });
    spinner.succeed(`${chalk.cyan("Ganache")} started`);

    // build contracts
    spinner.start(`Building ${chalk.cyan("contracts")}`);
    process.chdir(`${__dirname}/../../`);
    execSync("forge build");
    process.chdir(__dirname);
    spinner.succeed(`${chalk.cyan("Contracts")} built`);

    // deploy contracts
    spinner.start(`Deploying ${chalk.cyan("redemptor")}`);
    const accounts = await ganacheServer.provider.getInitialAccounts();
    const account = Object.values(accounts)[0];
    const secretKey = account.secretKey;
    const provider = new JsonRpcProvider(`http://localhost:${PORT}`);
    const signer = new Wallet(secretKey, provider);

    // the deployer is added as one of the signers, and the default threshold is 80%
    const { abi, bytecode } = require("./out/Redemptor.sol/Redemptor.json");
    const factory = new ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(8_000, [signer.address]);
    await contract.deployed();
    spinner.succeed(`${chalk.cyan("Redemptor")} deployed`);

    clearConsole();

    console.log(chalk.green("Local fork successfully set up!"));
    console.log();
    console.log(chalk.cyan("Used account:"));
    console.log();
    console.log("  Address:", signer.address);
    console.log("  Private key:", signer.privateKey);
    console.log();
    console.log(chalk.cyan("RPC endpoints:"));
    console.log();
    console.log(`  http://localhost:${PORT}`);
    console.log(`  ws://localhost:${PORT}`);
    console.log();
    console.log(chalk.cyan("Contract addresses:"));
    console.log();
    console.log("  Redemptor:", contract.address);
} catch (error) {
    spinner.fail(chalk.red("Could not setup local chain"));
    console.log();
    console.error(error);
}
