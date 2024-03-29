#!/usr/bin/env node

import { execSync } from "child_process";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther, formatUnits, parseUnits } from "@ethersproject/units";
import ganache from "ganache";
import ora from "ora";
import chalk from "chalk";
import {
  DERIVATION_PATH,
  DXDAO_MAINNET_AVATAR,
  DXD_MAINNET,
  MNEMONIC,
  PORT,
  require,
  USDC_MAINNET,
  USDT_MAINNET,
  WETH_MAINNET,
  __dirname,
} from "./commons.js";

const [forkUrl] = process.argv.slice(2);
if (!forkUrl) {
  console.error("Please specify an RPC endpoint to fork mainnet from.");
  process.exit(0);
}

const DOCKER = process.env.DOCKER === "true";

const spinner = ora();

const clearConsole = () => {
  if (process.stdout.isTTY)
    process.stdout.write(
      process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H"
    );
};

try {
  // get ganache going
  spinner.start(`Starting ${chalk.cyan("Ganache")}`);
  const ganacheServer = ganache.server({
    fork: { url: forkUrl },
    chain: { chainId: 1 },
    wallet: {
      mnemonic: MNEMONIC,
      hdPath: DERIVATION_PATH,
      unlockedAccounts: [DXDAO_MAINNET_AVATAR],
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

  // build contracts (if not in docker)
  if (!DOCKER) {
    spinner.start(`Building ${chalk.cyan("contracts")}`);
    process.chdir(`${__dirname}/../../`);
    execSync("forge build");
    process.chdir(__dirname);
    spinner.succeed(`${chalk.cyan("Contracts")} built`);
  }

  // deploy contracts
  spinner.start(`Deploying ${chalk.cyan("redemptor")}`);
  const accounts = await ganacheServer.provider.getInitialAccounts();
  const account = Object.values(accounts)[0];
  const secretKey = account.secretKey;
  const provider = new JsonRpcProvider(`http://localhost:${PORT}`);
  const signer = new Wallet(secretKey, provider);

  // the deployer is added as one of the signers, and the default threshold is 80%
  spinner.start(`Dealing ${chalk.cyan("DXD")}`);
  const {
    abi: redemptorAbi,
    bytecode: redemptorCode,
  } = require("../out/Redemptor.sol/Redemptor.json");
  const factory = new ContractFactory(redemptorAbi, redemptorCode, signer);
  const contract = await factory.deploy(8_000, [signer.address]);
  await contract.deployed();
  spinner.succeed(`${chalk.cyan("DXD")} dealt`);

  // send some dxd to the deployer
  const dxdaoAvatarSigner = await provider.getSigner(DXDAO_MAINNET_AVATAR);
  const { abi: erc20Abi } = require("../out/ERC20.sol/ERC20.json");
  const dxd = new Contract(DXD_MAINNET, erc20Abi);
  await dxd
    .connect(dxdaoAvatarSigner)
    .transfer(signer.address, parseUnits("10", 18));

  // approve WETH, USDC, USDT, DAI, and DXD for the redemptor
  for await (const tokenAddress of [WETH_MAINNET, USDC_MAINNET, USDT_MAINNET]) {
    await new Contract(tokenAddress, erc20Abi)
      .connect(signer)
      .approve(
        contract.address,
        parseUnits("10000", tokenAddress === WETH_MAINNET ? 18 : 6)
      )
      .then((tx) => tx.wait());
  }
  clearConsole();

  console.log(chalk.green("Local fork successfully set up!"));
  console.log();
  console.log(chalk.cyan("Used account:"));
  console.log();
  console.log("  Address:", signer.address);
  console.log("  Private key:", signer.privateKey);
  console.log("  ETH balance:", formatEther(await signer.getBalance()));
  console.log(
    "  DXD balance:",
    formatUnits(await dxd.connect(signer).balanceOf(signer.address), 18)
  );
  console.log(`  ${chalk.yellow("Account added as signer")}`);
  console.log();
  console.log(chalk.cyan("RPC endpoints:"));
  console.log();
  console.log(`  http://localhost:${PORT}`);
  console.log(`  ws://localhost:${PORT}`);
  console.log();
  console.log(chalk.cyan("Contract addresses:"));
  console.log();
  console.log("  Redemptor:", contract.address);
  if (!DOCKER) {
    console.log();
    console.log(
      chalk.yellow(
        "Use the interaction helper to interact with the fork and redemptor contract"
      )
    );
  }
} catch (error) {
  spinner.fail(chalk.red("Could not setup local chain"));
  console.log();
  console.error(error);
  process.exit(1);
}
